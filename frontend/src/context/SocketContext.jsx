import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Only connect in production or when explicitly needed
    if (process.env.NODE_ENV === 'production') {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      setSocket(newSocket)

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}




