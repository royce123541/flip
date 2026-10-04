import { auth } from './firebase'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  status: number
  /** Machine-readable code from the server, e.g. "quota_exceeded" or "pro_required". */
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken()
  // FormData needs the browser to set the multipart boundary itself.
  const isForm = init.body instanceof FormData
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'Request failed', body.code)
  return body as T
}
