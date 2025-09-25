import { defineStore } from 'pinia'
import ApiService from '../services/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('auth_user')) || null,
    token: localStorage.getItem('auth_token') || null,
    isLoggedIn: !!localStorage.getItem('auth_token'),
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => state.isLoggedIn && state.user !== null
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await ApiService.login(credentials)
        
        if (response.success) {
          this.user = response.user
          this.token = response.token
          this.isLoggedIn = true
          
          // Store user data in localStorage
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          
          // Set token in API service and localStorage
          ApiService.setToken(this.token)
          
          return { success: true, data: response }
        } else {
          throw new Error(response.message || 'Login failed')
        }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await ApiService.register(userData)
        
        if (response.success) {
          this.user = response.user
          this.token = response.token
          this.isLoggedIn = true
          
          // Store user data in localStorage
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          
          // Set token in API service and localStorage
          ApiService.setToken(this.token)
          
          return { success: true, data: response }
        } else {
          throw new Error(response || 'Registration failed')
        }
      } catch (error) {
        console.error('Registration error:', error)
        
        // Handle validation errors from server response
        if (error.response && error.response.data) {
          const errorData = error.response.data
          
          // Return validation errors for component to handle
          if (errorData.errors) {
            return { success: false, errors: errorData.errors }
          }
          
          // Handle general error messages
          if (errorData.message) {
            this.error = errorData.message
            return { success: false, error: errorData.message }
          }
        }
        
        // Fallback error handling
        this.error = error.message || 'Registration failed'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      
      try {
        if (this.token) {
          await ApiService.logout()
        }
      } catch (error) {
        console.error('Logout error:', error)
      }
      
      // Clear state regardless of API call success
      this.user = null
      this.isLoggedIn = false
      this.token = null
      this.error = null
      this.isLoading = false
      
      // Clear user data from localStorage
      localStorage.removeItem('auth_user')
      
      // Clear token from API service and localStorage
      ApiService.setToken(null)
    },

    async checkAuth() {
      if (!this.token) {
        return false
      }

      try {
        const response = await ApiService.getUser()
        
        if (response.success) {
          this.user = response.user
          this.isLoggedIn = true
          // Update localStorage with fresh user data
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          return true
        } else {
          this.clearAuth()
          return false
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        this.clearAuth()
        return false
      }
    },

    clearAuth() {
      this.user = null
      this.isLoggedIn = false
      this.token = null
      this.error = null
      // Clear user data from localStorage
      localStorage.removeItem('auth_user')
      ApiService.setToken(null)
    },

    clearError() {
      this.error = null
    },

    initializeAuth() {
      // Initialize token from localStorage on app start
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.token = token
        ApiService.setToken(token)
        this.checkAuth()
      }
    }
  }
})
