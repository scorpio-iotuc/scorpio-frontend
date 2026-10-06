import { getAuthHeaders } from './sessionService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(endpoint, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      ...options,
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de usuarios.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'No se pudo completar la accion de usuario.')
  }

  return data
}

export async function getUserById(userId) {
  return request(`/users/${userId}`)
}

export async function getUsers({ page = 1, limit = 5 } = {}) {
  const data = await request(`/users?page=${page}&limit=${limit}`)
  const users = Array.isArray(data) ? data : data?.data

  if (!Array.isArray(users)) {
    throw new Error('El servicio de usuarios retorno una respuesta inesperada.')
  }

  return {
    users,
    pagination: data?.pagination || {
      page,
      limit,
      total: users.length,
      totalPages: 1,
    },
  }
}

export async function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUser(userId, payload) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(userId) {
  return request(`/users/${userId}`, {
    method: 'DELETE',
  })
}
