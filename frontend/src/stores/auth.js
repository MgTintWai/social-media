import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Demo credentials for testing
        if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
          this.user = {
            id: 1,
            email: credentials.email,
            name: 'Demo User'
          }
          this.isLoggedIn = true
          return { success: true }
        } else {
          throw new Error('Invalid credentials')
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.user = {
          id: Date.now(),
          email: userData.email,
          username: userData.username || 'New User',
          profilePicture: userData.profilePicture || null
        }
        this.isLoggedIn = true
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
      this.isLoggedIn = false
      this.error = null
    },

    clearError() {
      this.error = null
    }
  }
})
