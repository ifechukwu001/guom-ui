export type ApiStatus =
  | "PENDING"
  | "PLAN"
  | "REVIEW"
  | "APPROVED"
  | "AVAILABLE"
  | "COMPLETED";

export interface SuccessResponse<T> {
  status_code: number;
  message: string;
  data: T | null;
}

export interface ErrorResponse {
  status_code: number;
  message: string;
}

export interface ValidationErrorResponse {
  status_code: number;
  message: string;
  errors: string[] | null;
}

export interface RegisterRequestSchema {
  email: string;
  password: string;
}

export interface LoginRequestSchema {
  email: string;
  password: string;
}

export interface ProfileResponseSchema {
  id: string;
  email: string;
}

export interface DocumentMetadata {
  filename: string;
  url: string;
}

export interface DocumentResponseSchema {
  filename: string;
  url: string;
}

export interface DocumentListItemResponseSchema {
  id: string;
  filename: string;
}

export interface StartSessionRequestSchema {
  prompt: string;
  doc_metas: DocumentMetadata[];
  doc_ids: string[];
}

export interface SessionStatusResponseSchema {
  id: string;
  status: ApiStatus;
}

export interface SessionPlanResponseSchema {
  message: string;
  stale: boolean;
}

export interface ReviewBlendPlanRequestSchema {
  feedback: string;
}

export interface SessionListItemResponseSchema {
  id: string;
  prompt: string;
  status: ApiStatus;
  created_at: string;
}

export interface SessionBlendItemResponseSchema {
  index: number;
  content: string;
  created_at: string;
}

export interface OffsetMetadata {
  offset: number;
  limit: number;
  total: number;
  count: number;
}

export interface CursorMetadata {
  next_cursor: number;
  limit: number;
  total: number;
  count: number;
}

export interface OffsetSuccessResponseSchema<T> {
  status_code: number;
  message: string;
  metadata: OffsetMetadata;
  data: T[];
}

export interface CursorSuccessResponseSchema<T> {
  status_code: number;
  message: string;
  metadata: CursorMetadata;
  data: T[];
}
