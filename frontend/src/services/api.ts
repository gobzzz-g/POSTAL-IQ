import {
  PredictionResponse,
  PostOffice,
  PostOfficeListResponse,
  SearchHistoryItem,
  BatchJobStatus,
  FeedbackReport,
  AnalyticsResponse,
} from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export function getSessionId(): string {
  let sid = localStorage.getItem('postaliq_session_id')
  if (!sid) {
    sid = 'sid-' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
    localStorage.setItem('postaliq_session_id', sid)
  }
  return sid
}

export function getUserSession(): string | null {
  return localStorage.getItem('postaliq_user_session')
}

export function setUserSession(session: string | null) {
  if (session) {
    localStorage.setItem('postaliq_user_session', session)
  } else {
    localStorage.removeItem('postaliq_user_session')
  }
}

export function getAdminToken(): string | null {
  return localStorage.getItem('postaliq_admin_token')
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem('postaliq_admin_token', token)
  } else {
    localStorage.removeItem('postaliq_admin_token')
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAdminToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, { ...options, headers })

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`API request failed with HTTP ${res.status}. Postal intelligence service may be unavailable.`)
    }
    throw new Error('API server returned an HTML document instead of JSON. Intelligence engine is offline.')
  }

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`
    try {
      const errorJson = await res.json()
      if (errorJson.detail) {
        errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail)
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg)
  }

  try {
    return (await res.json()) as Promise<T>
  } catch (err: any) {
    throw new Error('Failed to parse postal service response. Upstream payload malformed.')
  }
}

export const api = {
  predictAddress: (addressText: string, explicitPin?: string, clarificationAnswer?: string) => {
    return request<PredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify({
        address_text: addressText,
        explicit_pin: explicitPin || undefined,
        session_id: getSessionId(),
        clarification_answer: clarificationAnswer || undefined,
      }),
    })
  },

  getPostOfficesByPin: (pin: string) => {
    return request<PostOffice[]>(`/pin/${pin}`)
  },

  searchPostOffices: (params: {
    q?: string
    state?: string
    district?: string
    delivery_status?: string
    has_verified_coords?: boolean
    page?: number
    size?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params.q) searchParams.set('q', params.q)
    if (params.state) searchParams.set('state', params.state)
    if (params.district) searchParams.set('district', params.district)
    if (params.delivery_status) searchParams.set('delivery_status', params.delivery_status)
    if (params.has_verified_coords !== undefined) searchParams.set('has_verified_coords', String(params.has_verified_coords))
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.size) searchParams.set('size', params.size.toString())
    return request<PostOfficeListResponse>(`/search?${searchParams.toString()}`)
  },

  getNetworkDots: () => {
    return request<import('@/types').NetworkDot[]>('/network-dots')
  },

  autocomplete: (query: string) => {
    return request<Array<{
      id: number
      label: string
      locality: string
      pin_code: string
      district: string
      state: string
    }>>(`/autocomplete?q=${encodeURIComponent(query)}`)
  },

  uploadBatchCsv: (file: File, addressColumn: string = 'address') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('address_column', addressColumn)
    return request<BatchJobStatus>('/batch/validate', {
      method: 'POST',
      body: formData,
    })
  },

  getBatchJobStatus: (jobId: string) => {
    return request<BatchJobStatus>(`/batch/${jobId}`)
  },

  getBatchDownloadUrl: (jobId: string) => {
    return `${API_BASE}/batch/${jobId}/download`
  },

  getSearchHistory: () => {
    return request<SearchHistoryItem[]>(`/history?session_id=${encodeURIComponent(getSessionId())}`)
  },

  clearSearchHistory: () => {
    return request<{ message: string }>(`/history?session_id=${encodeURIComponent(getSessionId())}`, {
      method: 'DELETE',
    })
  },

  deleteHistoryItem: (id: number) => {
    return request<{ message: string }>(`/history/${id}?session_id=${encodeURIComponent(getSessionId())}`, {
      method: 'DELETE',
    })
  },

  submitFeedback: (data: {
    query_text: string
    predicted_pin?: string
    predicted_post_office?: string
    suggested_pin?: string
    suggested_post_office?: string
    user_comment?: string
  }) => {
    return request<FeedbackReport>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  listFeedback: () => {
    return request<FeedbackReport[]>('/feedback')
  },

  updateFeedbackStatus: (id: number, status: string) => {
    return request<FeedbackReport>(`/feedback/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  adminLogin: (usernameOrPayload: string | { username: string; password: string }, maybePassword?: string) => {
    const payload = typeof usernameOrPayload === 'string'
      ? { username: usernameOrPayload, password: maybePassword || '' }
      : usernameOrPayload
    return request<{ access_token: string; token_type: string; user: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  changeAdminCredentials: (data: {
    current_username?: string
    current_password: string
    new_username?: string
    new_password?: string
  }) => {
    return request<{ message: string; username: string }>('/admin/change-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },


  getAdminAnalytics: () => {
    return request<AnalyticsResponse>('/admin/analytics')
  },

  adminListPostOffices: (params: { page?: number; size?: number; query?: string }) => {
    const searchParams = new URLSearchParams()
    if (params.query) searchParams.set('query', params.query)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.size) searchParams.set('size', params.size.toString())
    return request<PostOfficeListResponse>(`/admin/post-offices?${searchParams.toString()}`)
  },

  adminCreatePostOffice: (data: Partial<PostOffice>) => {
    return request<PostOffice>('/admin/post-offices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  adminUpdatePostOffice: (id: number, data: Partial<PostOffice>) => {
    return request<PostOffice>(`/admin/post-offices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  adminDeletePostOffice: (id: number) => {
    return request<{ message: string }>(`/admin/post-offices/${id}`, {
      method: 'DELETE',
    })
  },

  adminBulkUploadPostOffices: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{
      imported_count: number
      skipped_count: number
      total_rows_processed: number
      message: string
    }>('/admin/post-offices/bulk-upload', {
      method: 'POST',
      body: formData,
    })
  },

  recordUserLogin: (usernameOrEmail: string, role: string = 'user') => {
    return request<{ message: string }>('/auth/record-login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: usernameOrEmail, role }),
    })
  },

  getAdminLoginHistory: (params: { page?: number; size?: number; query?: string }) => {
    const searchParams = new URLSearchParams()
    if (params.query) searchParams.set('query', params.query)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.size) searchParams.set('size', params.size.toString())
    return request<{
      items: Array<{
        id: number
        username_or_email: string
        role: string
        ip_address: string
        user_agent: string
        status: string
        created_at: string
      }>
      total: number
      page: number
      size: number
      total_pages: number
      stats: {
        total_logins: number
        unique_users: number
        admin_logins: number
      }
    }>(`/admin/login-history?${searchParams.toString()}`)
  },

  adminClearLoginHistory: () => {
    return request<{ message: string }>('/admin/login-history', {
      method: 'DELETE',
    })
  },

  getHealth: () => {
    return request<{ status: string; service: string; version: string }>('/health')
  },

  getReadiness: () => {
    return request<{
      status: string
      database: string
      tfidf_indexer_fitted: boolean
      ranking_engine: string
      indexed_documents: number
    }>('/ready')
  },
}
