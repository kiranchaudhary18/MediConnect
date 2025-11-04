import { createContext, useContext, useState, useEffect } from 'react'
import axios from '../utils/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

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
      
      // Append all form fields to FormData
      Object.keys(data).forEach(key => {
        if (key === 'photoFile' && data.photoFile) {
          formData.append('image', data.photoFile);
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.put('/api/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          ...response.data.user,
        }));
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
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

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(newUser)
        console.log('Registration successful')
        toast.success('Registered successfully!')
        return { success: true, user: newUser }
      } else {
        toast.error(response.data.message || 'Registration failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
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
      const response = await axios.post('/api/auth/refresh')
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(userData)
        return true
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
    }
    return false
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
