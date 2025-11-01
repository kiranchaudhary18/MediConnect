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
    // Only connect if user is authenticated
    if (!user || !token) return;
    
    // Use the deployed backend URL
    const backendUrl = 'https://mediconnect-sign-up-in2.onrender.com';
    
    console.log('Connecting to WebSocket at:', backendUrl);
    
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      // Emit authentication event if needed
      if (token) {
        newSocket.emit('authenticate', { token });
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      // Try to reconnect with a delay
      setTimeout(() => {
        newSocket.connect();
      }, 1000);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect if the server disconnects us
        newSocket.connect();
      }
    });
    
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [user, token]); // Add dependencies to re-run effect when user or token changes

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}




