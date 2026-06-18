import type {
  CursorSuccessResponseSchema,
  OffsetSuccessResponseSchema,
  SessionListItemResponseSchema,
  SessionStatusResponseSchema,
  StartSessionRequestSchema,
  SuccessResponse,
} from "~/types/openapi";
import { toSessionListItem, toSessionStatus } from "~/types/domain";
import { apiFetch } from "~/utils/apiClient";

export const useSessionApi = () => {
  const start = async (body: StartSessionRequestSchema) => {
    const response = await apiFetch<
      SuccessResponse<SessionStatusResponseSchema>
    >("/api/v1/sessions/actions/start", {
      method: "POST",
      body,
    });

    return response.data ? toSessionStatus(response.data) : null;
  };

  const list = async (params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.offset !== undefined) query.set("offset", String(params.offset));
    if (params.limit !== undefined) query.set("limit", String(params.limit));

    const response = await apiFetch<
      OffsetSuccessResponseSchema<SessionListItemResponseSchema>
    >(
      `/api/v1/sessions/actions/list${query.toString() ? `?${query.toString()}` : ""}`,
    );

    return {
      ...response,
      data: response.data.map(toSessionListItem),
    };
  };

  const status = async (sessionId: string) => {
    const response = await apiFetch<
      SuccessResponse<SessionStatusResponseSchema>
    >(`/api/v1/sessions/actions/${sessionId}/status`);

    return response.data ? toSessionStatus(response.data) : null;
  };

  const blends = async (
    sessionId: string,
    params: { cursor?: number; limit?: number } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.cursor !== undefined) query.set("cursor", String(params.cursor));
    if (params.limit !== undefined) query.set("limit", String(params.limit));

    return apiFetch<CursorSuccessResponseSchema<never>>(
      `/api/v1/sessions/blends/${sessionId}/blends${query.toString() ? `?${query.toString()}` : ""}`,
    );
  };

  return { start, list, status, blends };
};
