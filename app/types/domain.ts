import type {
  ApiStatus,
  SessionBlendItemResponseSchema,
  SessionListItemResponseSchema,
  SessionPlanResponseSchema,
  SessionStatusResponseSchema
} from './openapi'

export type SessionState = ApiStatus

export interface AppUser {
  id: string
  email: string
}

export interface SessionListItem {
  id: string
  prompt: string
  status: SessionState
  createdAt: string
}

export interface SessionPlan {
  message: string
  stale: boolean
}

export interface SessionStatus {
  id: string
  status: SessionState
}

export interface SessionBlendItem {
  index: number
  content: string
  createdAt: string
}

export const toSessionListItem = (item: SessionListItemResponseSchema): SessionListItem => ({
  id: item.id,
  prompt: item.prompt,
  status: item.status,
  createdAt: item.created_at
})

export const toSessionStatus = (item: SessionStatusResponseSchema): SessionStatus => ({
  id: item.id,
  status: item.status
})

export const toSessionPlan = (item: SessionPlanResponseSchema): SessionPlan => ({
  message: item.message,
  stale: item.stale
})

export const toSessionBlendItem = (item: SessionBlendItemResponseSchema): SessionBlendItem => ({
  index: item.index,
  content: item.content,
  createdAt: item.created_at
})
