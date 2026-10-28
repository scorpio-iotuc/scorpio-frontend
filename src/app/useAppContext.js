import { createContext, useContext } from 'react'

export const AppContext = createContext(null)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
