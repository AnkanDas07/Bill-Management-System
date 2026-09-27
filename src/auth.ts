export interface UserAccount {
  id: string
  name: string
  email: string
  companyName?: string
  phone?: string
}

export const CURRENT_USER_STORAGE_KEY = 'billflow_current_user'

const API_BASE = 'http://localhost:5000/api'

const apiRequest = async <T>(endpoint: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  return data as T
}

export const registerUser = async (input: {
  fullName: string
  companyName: string
  email: string
  phone: string
  password: string
}) => {
  const result = await apiRequest<{ user: UserAccount; message: string }>('/auth/register', {
    name: input.fullName,
    email: input.email,
    password: input.password,
    companyName: input.companyName,
    phone: input.phone,
  })

  return result.user
}

export const loginUser = async (email: string, password: string) => {
  const result = await apiRequest<{ user: UserAccount; message: string }>('/auth/login', {
    email,
    password,
  })

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(result.user))
  return result.user
}

export const getUserId = () => {
  const user = getStoredUser()
  return user?.id ?? null
}

export const getStoredUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserAccount) : null
  } catch {
    return null
  }
}

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
}
