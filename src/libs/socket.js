import { io } from 'socket.io-client'

// VITE_API_URL may be relative ("/api", same origin behind nginx) or absolute ("http://localhost:3000/api").
// Socket.IO is served by the backend at "<api path>/socket.io".
const API_URL = new URL(import.meta.env.VITE_API_URL || 'http://localhost:3000/api', window.location.origin)

export const SOCKET_URL = API_URL.origin
export const SOCKET_PATH = `${API_URL.pathname.replace(/\/$/, '')}/socket.io`

if (SOCKET_URL.includes('5173')) {
  console.warn('[socket] VITE_API_URL appears to point to the frontend. Expected backend URL, e.g. http://localhost:3000/api.')
}

console.info('[socket] connecting to', SOCKET_URL, SOCKET_PATH)

export const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: ['websocket'],
  autoConnect: false,
})
