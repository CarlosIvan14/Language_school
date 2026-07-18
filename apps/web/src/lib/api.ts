const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

let _refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
      if (!rt) return null
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      })
      if (!res.ok) {
        auth.clearTokens()
        return null
      }
      const data = await res.json()
      auth.saveTokens(data)
      return data.accessToken as string
    } catch {
      return null
    } finally {
      _refreshing = null
    }
  })()
  return _refreshing
}

async function request<T>(path: string, options: RequestInit = {}, _retry = true): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Auto-refresh on 401 then retry once
  if (res.status === 401 && _retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request<T>(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      }, false)
    }
    // Refresh failed — redirect to login
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new ApiError(401, 'Session expired')
  }

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
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string; fullName: string }
}

export const auth = {
  register: (data: {
    fullName: string; email: string; password: string;
    spanishLevel?: string; nativeLanguage?: string; timezone?: string;
    language?: string; phone?: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<any>('/auth/me'),

  logout: () => api.post('/auth/logout', {}),

  saveTokens: (res: AuthResponse) => {
    localStorage.setItem('access_token', res.accessToken)
    localStorage.setItem('refresh_token', res.refreshToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    // Cookie for middleware — set for 7 days (middleware just checks presence; actual validation is in API)
    document.cookie = `access_token=${res.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  },

  clearTokens: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    document.cookie = 'access_token=; path=/; max-age=0'
  },

  getUser: (): { id: string; email: string; role: string; fullName: string } | null => {
    if (typeof window === 'undefined') return null
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  },

  isLoggedIn: () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('access_token')
  },
}
