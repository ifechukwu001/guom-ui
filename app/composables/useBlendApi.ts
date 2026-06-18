import type {
  CursorSuccessResponseSchema,
  SessionBlendItemResponseSchema,
} from "~/types/openapi";
import { toSessionBlendItem } from "~/types/domain";
import { apiFetch } from "~/utils/apiClient";

export const useBlendApi = () => {
  const listBlends = async (
    sessionId: string,
    params: { cursor?: number; limit?: number } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.cursor !== undefined) query.set("cursor", String(params.cursor));
    if (params.limit !== undefined) query.set("limit", String(params.limit));

    const response = await apiFetch<
      CursorSuccessResponseSchema<SessionBlendItemResponseSchema>
    >(
      `/api/v1/sessions/blends/${sessionId}/blends${query.toString() ? `?${query.toString()}` : ""}`,
    );

    return {
      ...response,
      data: response.data.map(toSessionBlendItem),
    };
  };

  return { listBlends };
};
