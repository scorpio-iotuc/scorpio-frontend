import { useEffect, useState } from 'react'
import { AppContext } from './useAppContext'

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode)
    return () => document.documentElement.classList.remove('dark-mode')
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(previous => !previous)

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  )
}
