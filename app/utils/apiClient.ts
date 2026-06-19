import type { ErrorResponse, SuccessResponse } from "~/types/openapi";

export interface ApiError extends Error {
  statusCode?: number;
  payload?: ErrorResponse | { message?: string };
}

type ApiFetchOptions = Parameters<typeof $fetch>[1] & {
  _retryAuth?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;

const normalizeError = (error: unknown): ApiError => {
  const base = new Error("Request failed") as ApiError;

  if (typeof error === "object" && error !== null) {
    const candidate = error as ApiError & {
      statusCode?: number;
      data?: ErrorResponse;
    };
    base.message = candidate.message ?? base.message;
    base.statusCode = candidate.statusCode;
    base.payload = candidate.data ?? candidate.payload;
    return base;
  }

  base.message = String(error);
  return base;
};

const isUnauthorized = (error: unknown) =>
  normalizeError(error).statusCode === 401;

const isAuthEndpoint = (path: string) => {
  return path.startsWith("/api/v1/user/auth/");
};

const clearAuthState = () => {
  const user = useState<unknown>("auth:user");
  const isReady = useState<boolean>("auth:isReady");
  user.value = null;
  isReady.value = true;
};

const redirectToLogin = () => {
  if (!import.meta.client) return;

  const route = useRoute();
  if (route.path !== "/login") {
    void navigateTo("/login");
  }
};

const tryRefreshToken = async (baseURL: string) => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        await $fetch<SuccessResponse<null>>("/api/v1/user/auth/refresh", {
          baseURL,
          credentials: "include",
          method: "POST",
        });
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const config = useRuntimeConfig();
  const {
    _retryAuth = false,
    _skipAuthRefresh = false,
    ...fetchOptions
  } = options;

  try {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBase,
      credentials: "include",
      ...fetchOptions,
    });
  } catch (error) {
    if (
      !_skipAuthRefresh &&
      !_retryAuth &&
      !isAuthEndpoint(path) &&
      isUnauthorized(error)
    ) {
      const didRefresh = await tryRefreshToken(config.public.apiBase);

      if (didRefresh) {
        return apiFetch<T>(path, {
          ...fetchOptions,
          _retryAuth: true,
          _skipAuthRefresh: true,
        });
      }

      clearAuthState();
      redirectToLogin();
    }

    throw normalizeError(error);
  }
}

export type ApiSuccess<T> = SuccessResponse<T>;
