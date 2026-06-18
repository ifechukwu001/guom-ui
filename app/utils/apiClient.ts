import type { ErrorResponse, SuccessResponse } from '~/types/openapi'

export interface ApiError extends Error {
  statusCode?: number
  payload?: ErrorResponse | { message?: string }
}

const normalizeError = (error: unknown): ApiError => {
  const base = new Error('Request failed') as ApiError

  if (typeof error === 'object' && error !== null) {
    const candidate = error as ApiError & { statusCode?: number; data?: ErrorResponse }
    base.message = candidate.message ?? base.message
    base.statusCode = candidate.statusCode
    base.payload = candidate.data ?? candidate.payload
    return base
  }

  base.message = String(error)
  return base
}

export async function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}) {
  const config = useRuntimeConfig()

  try {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      ...options
    })
  } catch (error) {
    throw normalizeError(error)
  }
}

export type ApiSuccess<T> = SuccessResponse<T>
