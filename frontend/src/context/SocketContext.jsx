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
    if (!user || !token) {
      console.log('WebSocket: Not connecting - missing user or token');
      return;
    }
    
    // Use the deployed backend URL
    const backendUrl = 'https://mediconnect-sign-up-in2.onrender.com';
    
    console.log('WebSocket: Attempting to connect to:', backendUrl);
    
    const newSocket = io(backendUrl, {
      withCredentials: true,
      // Try websocket first, then fallback to polling
      transports: ['websocket', 'polling'],
      // Enable reconnection
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Timeout for connection attempt
      timeout: 20000,
      // Enable auto connect
      autoConnect: true,
      // Add authentication
      auth: {
        token: token
      },
      // Add query parameters if needed
      query: {
        'x-client-version': '1.0.0'
      }
    });

    // Connection established
    newSocket.on('connect', () => {
      console.log('WebSocket: Connected to server');
      console.log('WebSocket ID:', newSocket.id);
      
      // Emit authentication event if needed
      if (token) {
        console.log('WebSocket: Sending authentication...');
        newSocket.emit('authenticate', { token }, (response) => {
          console.log('WebSocket: Authentication response:', response);
        });
      }
    });

    // Connection error
    newSocket.on('connect_error', (err) => {
      console.error('WebSocket: Connection error:', {
        message: err.message,
        description: err.description,
        context: err.context,
        stack: err.stack
      });
      
      // Try to reconnect with a delay
      setTimeout(() => {
        console.log('WebSocket: Attempting to reconnect...');
        newSocket.connect();
      }, 1000);
    });

    // Connection closed
    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket: Disconnected. Reason:', reason);
      
      // If the server disconnects us, try to reconnect
      if (reason === 'io server disconnect') {
        console.log('WebSocket: Server requested disconnection. Will attempt to reconnect...');
        newSocket.connect();
      }
    });
    
    // General error
    newSocket.on('error', (error) => {
      console.error('WebSocket: Error:', {
        message: error.message,
        stack: error.stack
      });
    });

    // Log when reconnection is attempted
    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log(`WebSocket: Reconnection attempt ${attempt}`);
    });

    // Log when reconnection fails
    newSocket.io.on('reconnect_failed', () => {
      console.error('WebSocket: Reconnection failed after all attempts');
    });

    // Store the socket in state
    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log('WebSocket: Cleaning up...');
      if (newSocket) {
        newSocket.off(); // Remove all listeners
        newSocket.close();
      }
    };
  }, [user, token]); // Re-run effect when user or token changes

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}




