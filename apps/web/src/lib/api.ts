const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message ?? 'Request failed')
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// Auth helpers
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string; fullName: string }
}

export const auth = {
  register: (data: {
    fullName: string
    email: string
    password: string
    spanishLevel?: string
    nativeLanguage?: string
    timezone?: string
    language?: string
    phone?: string
  }) => api.post<AuthResponse>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<any>('/auth/me'),

  logout: () => api.post('/auth/logout', {}),

  saveTokens: (res: AuthResponse) => {
    localStorage.setItem('access_token', res.accessToken)
    localStorage.setItem('refresh_token', res.refreshToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    // Also set cookie so middleware can read it (server-side auth check)
    document.cookie = `access_token=${res.accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`
  },

  clearTokens: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    document.cookie = 'access_token=; path=/; max-age=0'
  },

  getUser: () => {
    if (typeof window === 'undefined') return null
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  },
}
