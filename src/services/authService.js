const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(endpoint, options) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach SCORPIO authentication services. Check your network connection.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const serverMessage = data?.message || data?.error
    let message

    if (response.status === 401 || response.status === 403) {
      message = serverMessage || 'Invalid email or password.'
    } else if (response.status >= 500) {
      message = serverMessage || 'SCORPIO authentication services are temporarily unavailable.'
    } else {
      message = serverMessage || 'The authentication request could not be completed.'
    }

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!data?.success || !data?.token) {
    throw new Error(data?.message || 'Login failed. Please verify your credentials.')
  }

  return data
}

export async function signup(name, email, password) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  if (!data?.id) {
    throw new Error('Sign up completed without a valid account response. Please try again.')
  }

  return data
}

export async function getAuthConfig() {
  try {
    const response = await fetch(`${API_URL}/auth/config`)
    const data = await response.json()

    if (response.ok && (data?.signupMode === 'public' || data?.signupMode === 'admin')) {
      return { signupMode: data.signupMode }
    }
  } catch {
    // Network/parse failure: fall through to the safe default below.
  }

  return { signupMode: 'admin' }
}
