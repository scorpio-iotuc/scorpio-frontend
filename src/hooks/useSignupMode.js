import { useEffect, useState } from 'react'
import { getAuthConfig } from '../services/authService'

let cachedConfigPromise = null

function loadAuthConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = getAuthConfig()
  }

  return cachedConfigPromise
}

export function useSignupMode() {
  const [signupMode, setSignupMode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    loadAuthConfig().then((config) => {
      if (!isMounted) return

      setSignupMode(config.signupMode)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return { signupMode, loading }
}
