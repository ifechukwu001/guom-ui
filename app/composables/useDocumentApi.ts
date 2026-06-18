import type {
  DocumentListItemResponseSchema,
  DocumentResponseSchema,
  SuccessResponse,
} from "~/types/openapi";
import { apiFetch } from "~/utils/apiClient";
import { getErrorStatus } from "~/utils/userFacingError";

export const useDocumentApi = () => {
  const config = useRuntimeConfig();

  const toForms = (file: File) => {
    const fileForm = new FormData();
    fileForm.append("file", file);

    const documentForm = new FormData();
    documentForm.append("document", file);

    return [fileForm, documentForm];
  };

  const upload = async (file: File) => {
    const forms = toForms(file);
    let lastError: unknown;

    for (const body of forms) {
      try {
        const response = await apiFetch<
          SuccessResponse<DocumentResponseSchema>
        >("/api/v1/sessions/files/upload", {
          method: "POST",
          body,
        });

        return response.data ?? null;
      } catch (cause) {
        lastError = cause;
        const status = getErrorStatus(cause);

        if (status !== 404 && status !== 405 && status !== 422) {
          throw cause;
        }
      }
    }

    throw lastError ?? new Error("Upload endpoint is not available");
  };

  const listFiles = async (): Promise<DocumentListItemResponseSchema[]> => {
    const response = await apiFetch<
      SuccessResponse<DocumentListItemResponseSchema[]>
    >("/api/v1/sessions/files/list");
    return response.data ?? [];
  };

  return { upload, listFiles };
};
