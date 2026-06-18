import type {
  SessionBlendItem,
  SessionPlan,
  SessionListItem,
  SessionStatus,
} from "~/types/domain";
import type { ApiStatus, StartSessionRequestSchema } from "~/types/openapi";
import { getErrorStatus, toUserFacingError } from "~/utils/userFacingError";

export const useSessionFlow = () => {
  const sessionApi = useSessionApi();
  const planApi = usePlanApi();
  const blendApi = useBlendApi();
  const authStore = useAuthStore();

  const currentSessionId = useState<string | null>(
    "flow:sessionId",
    () => null,
  );
  const currentStatus = useState<SessionStatus | null>(
    "flow:status",
    () => null,
  );
  const currentPlan = useState<SessionPlan | null>("flow:plan", () => null);
  const blends = useState<SessionBlendItem[]>("flow:blends", () => []);
  const sessions = useState<SessionListItem[]>("flow:sessions", () => []);
  const loading = useState<boolean>("flow:loading", () => false);
  const polling = useState<boolean>("flow:polling", () => false);
  const error = useState<string | null>("flow:error", () => null);

  const pause = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const statusPollInterval = (status?: ApiStatus | null) => {
    switch (status) {
      case "PENDING":
        return 3500;
      case "PLAN":
        return 5000;
      case "REVIEW":
        return 4500;
      case "APPROVED":
        return 3000;
      case "AVAILABLE":
        return 2500;
      case "COMPLETED":
        return 0;
      default:
        return 4000;
    }
  };

  const appendBlendItems = (items: SessionBlendItem[]) => {
    if (!items.length) return;

    const existing = new Set(
      blends.value.map((item) => `${item.index}:${item.createdAt}`),
    );
    const next = items.filter(
      (item) => !existing.has(`${item.index}:${item.createdAt}`),
    );
    if (!next.length) return;

    blends.value = [...blends.value, ...next].sort((a, b) => a.index - b.index);
  };

  const setStatus = (status: SessionStatus | null) => {
    currentStatus.value = status;
  };

  const waitForStatuses = async (
    sessionId: string,
    targets: ApiStatus[],
    options: { intervalMs?: number; maxAttempts?: number } = {},
  ) => {
    const fallbackIntervalMs = options.intervalMs ?? 4000;
    const maxAttempts = options.maxAttempts ?? 180;

    polling.value = true;

    try {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const status = await sessionApi.status(sessionId);
        setStatus(status);

        if (status && targets.includes(status.status)) {
          return status;
        }

        if (status?.status === "COMPLETED") {
          return status;
        }

        const delay =
          options.intervalMs ??
          statusPollInterval(status?.status) ??
          fallbackIntervalMs;
        await pause(delay);
      }

      return currentStatus.value;
    } finally {
      polling.value = false;
    }
  };

  const loadPlanIfAvailable = async (sessionId: string) => {
    const status = currentStatus.value?.status;
    if (!status || status === "PENDING") {
      currentPlan.value = null;
      return null;
    }

    try {
      const plan = await planApi.getPlan(sessionId);
      currentPlan.value = plan;
      return plan;
    } catch (cause) {
      if (getErrorStatus(cause) === 404) {
        currentPlan.value = null;
        return null;
      }
      throw cause;
    }
  };

  const pollBlendsUntilDone = async (
    sessionId: string,
    options: {
      intervalMs?: number;
      pageLimit?: number;
      maxCycles?: number;
    } = {},
  ) => {
    const intervalMs = options.intervalMs ?? 3000;
    const pageLimit = options.pageLimit ?? 10;
    const maxCycles = options.maxCycles ?? 240;

    let cursor: number | undefined;

    polling.value = true;
    try {
      for (let cycle = 0; cycle < maxCycles; cycle += 1) {
        const response = await blendApi.listBlends(sessionId, {
          cursor,
          limit: pageLimit,
        });
        appendBlendItems(response.data);

        const status = await sessionApi.status(sessionId);
        setStatus(status);

        if (status?.status === "COMPLETED") {
          break;
        }

        if (response.data.length > 0) {
          const nextCursor = response.metadata?.next_cursor;
          if (typeof nextCursor === "number" && nextCursor !== cursor) {
            cursor = nextCursor;
          }
          await pause(intervalMs);
          continue;
        }

        await pause(intervalMs);
      }
    } finally {
      polling.value = false;
    }
  };

  const refreshSessions = async () => {
    try {
      const response = await sessionApi.list({ offset: 0, limit: 10 });
      sessions.value = response.data;
      error.value = null;
    } catch (cause) {
      sessions.value = [];
      error.value = toUserFacingError(cause, "Unable to load sessions");

      if (getErrorStatus(cause) === 401) {
        authStore.setUser(null);
        await navigateTo("/login");
      }
    }
  };

  const startSession = async (body: StartSessionRequestSchema) => {
    loading.value = true;
    error.value = null;

    try {
      const started = await sessionApi.start(body);
      currentSessionId.value = started?.id ?? null;
      currentStatus.value = started;
      await refreshSessions();
      return started;
    } catch (cause) {
      error.value = toUserFacingError(cause, "Unable to start session");

      if (getErrorStatus(cause) === 401) {
        authStore.setUser(null);
        await navigateTo("/login");
      }

      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadSessionState = async (sessionId: string) => {
    currentSessionId.value = sessionId;

    try {
      setStatus(await sessionApi.status(sessionId));
      await loadPlanIfAvailable(sessionId);

      if (
        currentStatus.value?.status === "AVAILABLE" ||
        currentStatus.value?.status === "COMPLETED"
      ) {
        const result = await blendApi.listBlends(sessionId);
        blends.value = result.data;
      } else {
        blends.value = [];
      }

      error.value = null;
      return true;
    } catch (cause) {
      error.value = toUserFacingError(cause, "Unable to load session data");

      if (getErrorStatus(cause) === 401) {
        authStore.setUser(null);
        await navigateTo("/login");
      }

      return false;
    }
  };

  const submitReview = async (feedback: string) => {
    if (!currentSessionId.value) return;
    await planApi.reviewPlan(currentSessionId.value, { feedback });
  };

  const approveCurrentPlan = async () => {
    if (!currentSessionId.value) return;
    await planApi.approvePlan(currentSessionId.value);
  };

  const waitForPlanAndLoad = async (sessionId: string) => {
    const status = await waitForStatuses(sessionId, [
      "PLAN",
      "APPROVED",
      "AVAILABLE",
      "COMPLETED",
    ]);

    if (!status) return null;

    await loadPlanIfAvailable(sessionId);

    if (status.status === "AVAILABLE" || status.status === "COMPLETED") {
      await pollBlendsUntilDone(sessionId);
    }

    if (status.status === "APPROVED") {
      return waitForAvailableAndPoll(sessionId);
    }

    return status;
  };

  const submitReviewAndWaitForPlan = async (feedback: string) => {
    if (!currentSessionId.value) return null;

    await submitReview(feedback);
    return waitForStatuses(currentSessionId.value, ["PLAN", "COMPLETED"], {
      intervalMs: 4500,
    });
  };

  const approveAndPollBlends = async () => {
    if (!currentSessionId.value) return null;

    await approveCurrentPlan();
    const status = await waitForStatuses(
      currentSessionId.value,
      ["AVAILABLE", "COMPLETED"],
      { intervalMs: 3000 },
    );

    if (status?.status === "AVAILABLE" || status?.status === "COMPLETED") {
      await pollBlendsUntilDone(currentSessionId.value);
    }

    return status;
  };

  const waitForPlanAfterReview = async (sessionId: string) => {
    const status = await waitForStatuses(sessionId, ["PLAN", "COMPLETED"], {
      intervalMs: 4500,
    });

    if (status?.status === "PLAN" || status?.status === "COMPLETED") {
      await loadPlanIfAvailable(sessionId);
    }

    return status;
  };

  const waitForAvailableAndPoll = async (sessionId: string) => {
    const status = await waitForStatuses(
      sessionId,
      ["AVAILABLE", "COMPLETED"],
      {
        intervalMs: 3000,
      },
    );

    if (status?.status === "AVAILABLE" || status?.status === "COMPLETED") {
      await pollBlendsUntilDone(sessionId);
    }

    return status;
  };

  const continuePollingForSession = async (sessionId: string) => {
    const status = await sessionApi.status(sessionId);
    setStatus(status);

    if (!status || status.status === "COMPLETED" || status.status === "PLAN") {
      return status;
    }

    if (status.status === "PENDING") {
      return waitForPlanAndLoad(sessionId);
    }

    if (status.status === "REVIEW") {
      return waitForPlanAfterReview(sessionId);
    }

    if (status.status === "APPROVED") {
      return waitForAvailableAndPoll(sessionId);
    }

    if (status.status === "AVAILABLE") {
      await pollBlendsUntilDone(sessionId);
      return currentStatus.value;
    }

    return status;
  };

  const reset = () => {
    currentSessionId.value = null;
    currentStatus.value = null;
    currentPlan.value = null;
    blends.value = [];
    error.value = null;
    polling.value = false;
  };

  return {
    currentSessionId,
    currentStatus,
    currentPlan,
    blends,
    sessions,
    loading,
    polling,
    error,
    refreshSessions,
    startSession,
    loadSessionState,
    waitForPlanAndLoad,
    submitReviewAndWaitForPlan,
    approveAndPollBlends,
    waitForPlanAfterReview,
    waitForAvailableAndPoll,
    continuePollingForSession,
    pollBlendsUntilDone,
    submitReview,
    approveCurrentPlan,
    reset,
  };
};
