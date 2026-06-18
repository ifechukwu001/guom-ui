import type { ApiError } from "~/utils/apiClient";

const looksTechnical = (message: string) => {
  return (
    message.includes("http://") ||
    message.includes("https://") ||
    message.startsWith("[GET]") ||
    message.startsWith("[POST]")
  );
};

export const getErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;
  return (error as ApiError).statusCode;
};

export const toUserFacingError = (error: unknown, fallback: string): string => {
  const status = getErrorStatus(error);
  const payload =
    typeof error === "object" && error !== null
      ? (error as ApiError).payload
      : undefined;
  const payloadMessage =
    typeof payload?.message === "string" ? payload.message : undefined;
  const payloadErrors = (payload as { errors?: string[] | null } | undefined)
    ?.errors;
  const validationDetails =
    Array.isArray(payloadErrors) && payloadErrors.length
      ? payloadErrors.join(", ")
      : undefined;

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status !== undefined && status >= 500) {
    return "The service is temporarily unavailable. Please try again shortly.";
  }

  if (status === 400 || status === 422) {
    if (validationDetails) {
      if (validationDetails.toLowerCase().includes("valid uuid")) {
        return "This environment requires server-generated document IDs. Please upload documents through the backend document service first.";
      }

      return validationDetails;
    }

    if (payloadMessage) {
      return payloadMessage;
    }
  }

  if (
    error instanceof Error &&
    error.message &&
    !looksTechnical(error.message)
  ) {
    return error.message;
  }

  return fallback;
};
