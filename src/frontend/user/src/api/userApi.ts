// src/api/userApi.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'

export interface Address {
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
}

export interface User {
  id: string
  name: string
  email: string
  cpf: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  active: boolean
  address: Address | null
}

interface AuthData {
  user: User
  token: string
}

interface ApiResponse<T> {
  status: string
  data: T
  message?: string
}

// ── helpers ──────────────────────────────────────────────

function authHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()

  if (!text) {
    if (!res.ok) throw new Error(`Erro ${res.status}: servidor não retornou resposta`)
    return {} as T
  }

  let json: Record<string, unknown>
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Erro ${res.status}: resposta inválida do servidor`)
  }

  if (!res.ok) throw new Error((json.message as string) || `Erro ${res.status}`)
  return json as T
}

// ── auth ─────────────────────────────────────────────────

export async function apiRegister(data: {
  name: string
  email: string
  password: string
  cpf?: string
  phone?: string
  address?: Partial<Address>
}): Promise<AuthData> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await handleResponse<ApiResponse<AuthData>>(res)
  return json.data
}

export async function apiLogin(email: string, password: string): Promise<AuthData> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await handleResponse<ApiResponse<AuthData>>(res)
  return json.data
}

// ── users ─────────────────────────────────────────────────

// Retorna usuários ativos
export async function apiGetAllUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users/`, {
    headers: { ...authHeader() },
  })
  const json = await handleResponse<ApiResponse<User[]>>(res)
  return json.data
}

// Retorna TODOS os usuários (ativos + inativos) — admin
export async function apiGetAllUsersAdmin(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users/all`, {
    headers: { ...authHeader() },
  })
  const json = await handleResponse<ApiResponse<User[]>>(res)
  return json.data
}

export async function apiGetUserById(id: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: { ...authHeader() },
  })
  const json = await handleResponse<ApiResponse<User>>(res)
  return json.data
}

export async function apiUpdateUser(
  id: string,
  data: {
    name?: string
    email?: string
    cpf?: string
    phone?: string
    address?: Partial<Address>
  }
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  })
  const json = await handleResponse<ApiResponse<User>>(res)
  return json.data
}

export async function apiUpdatePassword(id: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ password }),
  })
  await handleResponse<ApiResponse<null>>(res)
}

export async function apiDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  })
  await handleResponse<ApiResponse<null>>(res)
}

export async function apiReactivateUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}/reactivate`, {
    method: 'PUT',
    headers: { ...authHeader() },
  })
  await handleResponse<ApiResponse<null>>(res)
}

export async function apiHardDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}/permanent`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  })
  await handleResponse<ApiResponse<null>>(res)
}
