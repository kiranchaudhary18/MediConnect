import { createContext, useCallback, useContext, useEffect, useState } from 'react'
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

// Add a small delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const MAX_RETRIES = 3;

  const connectWebSocket = useCallback(async () => {
    if (!token) {
      console.log('WebSocket: No token available, skipping connection');
      return null;
    }
    
    // Use the same base URL as configured in axios for consistency
    const baseURL = import.meta.env.VITE_API_URL || 'https://mediconnect-sign-up-in2.onrender.com';
    // Create WebSocket URL by replacing http/https with ws/wss
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendUrl = baseURL.replace(/^https?:/, wsProtocol);
    
    console.log('WebSocket: Attempting to connect to:', backendUrl);
    
    try {
      console.log('WebSocket: Creating new connection to', backendUrl);
      
      const newSocket = io(backendUrl, {
        path: '/socket.io',  // Ensure this matches your server's socket.io path
        withCredentials: true,
        // Try websocket first, then fallback to polling
        transports: ['websocket', 'polling'],
        // Enable reconnection
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
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
          'x-client-version': '1.0.0',
          'x-auth-token': token
        }
    });

    // Wrap in a promise to handle connection state
    return new Promise((resolve) => {
      const onConnect = () => {
        console.log('WebSocket: Connected to server');
        console.log('WebSocket ID:', newSocket.id);
        
        // Remove this listener to prevent memory leaks
        newSocket.off('connect', onConnect);
        
        // Emit authentication event if needed
        if (token) {
          console.log('WebSocket: Sending authentication...');
          newSocket.emit('authenticate', { token }, (response) => {
            console.log('WebSocket: Authentication response:', response);
            if (response && response.success) {
              console.log('WebSocket: Authentication successful');
              resolve(newSocket);
            } else {
              console.error('WebSocket: Authentication failed', response?.error);
              newSocket.disconnect();
              resolve(null);
            }
          });
        } else {
          resolve(newSocket);
        }
      };
      
      // Set up connection timeout
      const timeout = setTimeout(() => {
        console.error('WebSocket: Connection timeout');
        newSocket.off('connect', onConnect);
        newSocket.disconnect();
        resolve(null);
      }, 10000);
      
      // Set up connection handler
      newSocket.on('connect', onConnect);
      
      // Set up error handler
      const onError = (err) => {
        console.error('WebSocket: Connection error:', err);
        clearTimeout(timeout);
        newSocket.off('connect', onConnect);
        newSocket.off('connect_error', onError);
        resolve(null);
      };
      
      newSocket.on('connect_error', onError);
    });
  } catch (error) {
    console.error('WebSocket: Connection setup error:', error);
    return null;
  }

    // Main effect to handle WebSocket connection
  useEffect(() => {
    let isMounted = true;
    let socketInstance = null;
    let retryCount = 0;

    const setupWebSocket = async () => {
      // Don't attempt to connect if we've exceeded max retries
      if (retryCount >= MAX_RETRIES) {
        console.error('WebSocket: Max retry attempts reached');
        return;
      }

      // Only connect if we have a token and the component is still mounted
      if (!token || !isMounted) return;

      try {
        console.log(`WebSocket: Connection attempt ${retryCount + 1}/${MAX_RETRIES}`);
        
        // Attempt to connect
        socketInstance = await connectWebSocket();
        
        if (socketInstance && isMounted) {
          // Set up event handlers
          socketInstance.on('disconnect', (reason) => {
            console.log('WebSocket: Disconnected. Reason:', reason);
            if (reason === 'io server disconnect') {
              // Server requested disconnection, try to reconnect
              console.log('WebSocket: Server requested disconnection. Will attempt to reconnect...');
              setupWebSocket();
            }
          });

          socketInstance.on('error', (error) => {
            console.error('WebSocket: Error:', error);
          });

          // Update the socket in state
          setSocket(socketInstance);
          setConnectionAttempts(0); // Reset retry counter on successful connection
        } else if (isMounted) {
          // Connection failed, retry with backoff
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
          console.log(`WebSocket: Retrying in ${backoffTime}ms...`);
          
          await delay(backoffTime);
          retryCount++;
          setConnectionAttempts(retryCount);
          setupWebSocket();
        }
      } catch (error) {
        console.error('WebSocket: Setup error:', error);
        if (isMounted && retryCount < MAX_RETRIES) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
          console.log(`WebSocket: Retrying after error in ${backoffTime}ms...`);
          
          await delay(backoffTime);
          retryCount++;
          setConnectionAttempts(retryCount);
          setupWebSocket();
        }
      }
    };

    // Initial connection attempt
    setupWebSocket();

    // Cleanup function
    return () => {
      isMounted = false;
      if (socketInstance) {
        console.log('WebSocket: Cleaning up...');
        socketInstance.off();
        socketInstance.disconnect();
      }
    };
  }, [token, connectWebSocket]);
  }, [user, token]); // Re-run effect when user or token changes

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}




