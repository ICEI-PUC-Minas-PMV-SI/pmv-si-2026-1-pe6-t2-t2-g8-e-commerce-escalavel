import { API_URL } from '@/src/config/env'
import { HttpClient } from './httpClient'
import { tokenStore } from './tokenStore'

const http = new HttpClient(API_URL)

function authHeaders(): HeadersInit {
  const t = tokenStore.get()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/* ── Types ── */
export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
}

export interface User {
  id: string
  name: string
  email: string
  cpf?: string | null
  phone?: string | null
  role: 'admin' | 'customer'
  active: boolean
  address?: Address
  created_at: string
}

interface ApiEnvelope<T> { status: string; data: T }
interface LoginPayload { email: string; password: string }
interface RegisterPayload { name: string; email: string; password: string; cpf?: string; phone?: string }
interface UpdateUserPayload { name?: string; email?: string; cpf?: string; phone?: string; address?: Address }

/* ── Service ── */
export const userService = {
  async checkEmailAvailable(email: string): Promise<boolean> {
    const res = await http.get<ApiEnvelope<{ available: boolean }>>(`/auth/check-email?email=${encodeURIComponent(email)}`)
    return res.data.available
  },

  async login(payload: LoginPayload) {
    const res = await http.post<ApiEnvelope<{ token: string; user: User }>>('/auth/login', payload)
    return res.data
  },

  async register(payload: RegisterPayload) {
    const res = await http.post<ApiEnvelope<{ token: string; user: User }>>('/auth/register', payload)
    return res.data
  },

  async getById(id: string): Promise<User> {
    const res = await http.get<ApiEnvelope<User>>(`/users/${id}`, { headers: authHeaders() })
    return res.data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await http.put<ApiEnvelope<User>>(`/users/${id}`, payload, { headers: authHeaders() })
    return res.data
  },

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await http.put(`/users/${id}/password`, { password: newPassword }, { headers: authHeaders() })
  },

  async deactivate(id: string): Promise<void> {
    await http.del(`/users/${id}`, { headers: authHeaders() })
  },

  async getAllUsersAdmin(): Promise<User[]> {
    const res = await http.get<ApiEnvelope<User[]>>('/users/all', { headers: authHeaders() })
    return res.data
  },

  async reactivate(id: string): Promise<void> {
    await http.put(`/users/${id}/reactivate`, {}, { headers: authHeaders() })
  },

  async hardDelete(id: string): Promise<void> {
    await http.del(`/users/${id}/permanent`, { headers: authHeaders() })
  },
}
