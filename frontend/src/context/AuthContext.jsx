import { createContext, useContext, useState, useEffect } from 'react'
import axios from '../utils/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export { AuthContext }

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'))

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const response = await axios.get('/auth/me')
      if (response.data.success) {
        setUser(response.data.user)
      } else {
        throw new Error('Failed to load user')
      }
    } catch (error) {
      console.error('Load user error:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data) => {
    try {
      const formData = new FormData();
      
      console.log('Updating profile with data:', data);
      
      // Append all form fields to FormData
      Object.keys(data).forEach(key => {
        if (key === 'photoFile' && data.photoFile) {
          formData.append('image', data.photoFile);
          console.log('Appended image file:', data.photoFile.name);
        } else if (data[key] !== undefined && data[key] !== null) {
          // Map phone to contact for the backend
          if (key === 'phone') {
            formData.append('contact', data[key]);
            console.log('Appended contact:', data[key]);
          } else if (key !== 'photoFile') { // Skip photoFile as it's handled separately
            formData.append(key, data[key]);
            console.log(`Appended ${key}:`, data[key]);
          }
        }
      });

      // Get the token from storage
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      const token = storage.getItem('token');

      console.log('Sending update request to /auth/profile');
      const response = await axios.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Update profile response:', response.data);

      if (response.data && response.data.success) {
        // Update the user in context
        const updatedUser = {
          ...response.data.user,
          // Map contact back to phone for frontend
          phone: response.data.user.contact || (user?.phone || '')
        };
        
        setUser(updatedUser);
        
        // Update localStorage if needed
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post('/auth/login', { 
        email: email.trim(),
        password: password
      });
      
      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Store token based on rememberMe preference
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Update state
        setToken(newToken);
        setUser(userData);
        console.log('Login successful');
        toast.success('Logged in successfully!');
        
        return { 
          success: true, 
          user: userData,
          role: userData.role
        };
      } else {
        const errorMessage = response.data?.message || 'Login failed';
        toast.error(errorMessage);
        return { 
          success: false, 
          message: errorMessage 
        };
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || error.message || 'Login failed. Please check your connection.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData, rememberMe = false) => {
    try {
      const response = await axios.post('/auth/register', userData)
      
      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Store token based on rememberMe preference
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        storage.setItem('user', JSON.stringify(userData));
        
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        console.log('Registration successful');
        toast.success('Registered successfully!');
        
        return { 
          success: true, 
          user: userData,
          role: userData.role 
        };
      } else {
        const errorMessage = response.data?.message || 'Registration failed';
        toast.error(errorMessage);
        return { 
          success: false, 
          message: errorMessage 
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      
      // Reset state
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
      
      toast.success('Logged out successfully!')
      
      // Redirect to home page after logout
      window.location.href = '/';
    }
  }

  const refreshToken = async () => {
    try {
      const response = await axios.post('/auth/refresh')
      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data
        
        // Store the new token where the old one was stored
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage
        storage.setItem('token', newToken)
        storage.setItem('user', JSON.stringify(userData))
        
        // Update state and axios headers
        setToken(newToken)
        setUser(userData)
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        
        return newToken
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      // If refresh fails, logout the user
      logout()
    }
    return null
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    refreshToken,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
