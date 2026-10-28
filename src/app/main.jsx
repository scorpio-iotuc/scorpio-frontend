import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Routing from './Route.jsx'
import { AppProvider } from './AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <Routing />
    </AppProvider>
  </StrictMode>,
)
