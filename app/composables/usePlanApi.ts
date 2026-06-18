import type {
  ReviewBlendPlanRequestSchema,
  SessionPlanResponseSchema,
  SuccessResponse,
} from "~/types/openapi";
import { toSessionPlan } from "~/types/domain";
import { apiFetch } from "~/utils/apiClient";

export const usePlanApi = () => {
  const getPlan = async (sessionId: string) => {
    const response = await apiFetch<SuccessResponse<SessionPlanResponseSchema>>(
      `/api/v1/sessions/blends/${sessionId}/plan`,
    );

    return response.data ? toSessionPlan(response.data) : null;
  };

  const reviewPlan = async (
    sessionId: string,
    body: ReviewBlendPlanRequestSchema,
  ) => {
    await apiFetch<SuccessResponse<null>>(
      `/api/v1/sessions/blends/${sessionId}/review`,
      {
        method: "POST",
        body,
      },
    );
  };

  const approvePlan = async (sessionId: string) => {
    await apiFetch<SuccessResponse<null>>(
      `/api/v1/sessions/blends/${sessionId}/approve`,
      {
        method: "POST",
      },
    );
  };

  return { getPlan, reviewPlan, approvePlan };
};
