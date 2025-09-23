<template>
  <div class="gradient-background">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="app-title">Social</h1>
        <p class="app-subtitle">Connect with friends and share your moments</p>
        
        <div class="auth-tabs">
          <button 
            class="auth-tab active"
            @click="$router.push('/')"
          >
            Login
          </button>
          <button 
            class="auth-tab"
            @click="$router.push('/register')"
          >
            Register
          </button>
        </div>

        <div class="auth-content">
          <h3 class="text-start mb-3">Welcome back</h3>
          <p class="text-start text-muted mb-4">Enter your credentials to access your account</p>

          <div v-if="authStore.error" class="alert alert-danger">
            {{ authStore.error }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label text-start d-block">Email or Username</label>
              <input 
                type="email" 
                id="email"
                class="form-control" 
                placeholder="Enter your email or username"
                v-model="loginForm.email"
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label text-start d-block">Password</label>
              <input 
                type="password" 
                id="password"
                class="form-control" 
                placeholder="Enter your password"
                v-model="loginForm.password"
                required
              />
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </span>
              <span v-else>Sign in</span>
            </button>
          </form>

          <div class="demo-info">
            <strong>Demo account for testing:</strong><br>
            Email: demo@example.com<br>
            Password: demo123
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginPage',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const loginForm = reactive({
      email: '',
      password: ''
    })

    const handleLogin = async () => {
      authStore.clearError()
      
      const result = await authStore.login({
        email: loginForm.email,
        password: loginForm.password
      })

      if (result.success) {
        // Redirect to home page
        router.push('/home')
      }
    }

    return {
      authStore,
      loginForm,
      handleLogin
    }
  }
}
</script>
