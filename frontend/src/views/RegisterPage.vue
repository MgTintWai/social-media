<template>
  <div class="gradient-background">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="app-title">Social</h1>
        <p class="app-subtitle">Connect with friends and share your moments</p>
        
        <div class="auth-tabs">
          <button 
            class="auth-tab"
            @click="$router.push('/')"
          >
            Login
          </button>
          <button 
            class="auth-tab active"
            @click="$router.push('/register')"
          >
            Register
          </button>
        </div>

        <div class="auth-content">
          <h3 class="text-start mb-3">Create account</h3>
          <p class="text-start text-muted mb-4">Join our community and start sharing</p>

          <div v-if="authStore.error" class="alert alert-danger">
            {{ authStore.error }}
          </div>

          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="username" class="form-label text-start d-block">Username</label>
              <input 
                type="text" 
                id="username"
                class="form-control" 
                placeholder="Choose a username"
                v-model="registerForm.username"
                required
              />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label text-start d-block">Email</label>
              <input 
                type="email" 
                id="email"
                class="form-control" 
                placeholder="Enter your email"
                v-model="registerForm.email"
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label text-start d-block">Password</label>
              <input 
                type="password" 
                id="password"
                class="form-control" 
                placeholder="Create a password"
                v-model="registerForm.password"
                required
                minlength="6"
              />
            </div>

            <div class="mb-3">
              <label for="profilePicture" class="form-label text-start d-block">Profile Picture URL (optional)</label>
              <input 
                type="url" 
                id="profilePicture"
                class="form-control" 
                placeholder="https://example.com/your-photo.jpg"
                v-model="registerForm.profilePicture"
              />
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="authStore.isLoading || !isFormValid"
            >
              <span v-if="authStore.isLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating account...
              </span>
              <span v-else>Create account</span>
            </button>
          </form>

          <div class="demo-info">
            <strong>Demo account for testing:</strong><br>
            Email: demo@example.com, Password: demo123
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterPage',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const registerForm = reactive({
      username: '',
      email: '',
      password: '',
      profilePicture: ''
    })

    const isFormValid = computed(() => {
      return registerForm.username && 
             registerForm.email && 
             registerForm.password && 
             registerForm.password.length >= 6
    })

    const handleRegister = async () => {
      authStore.clearError()

      const result = await authStore.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        profilePicture: registerForm.profilePicture
      })

      if (result.success) {
        console.log('Registration successful!', authStore.user)
        router.push('/home')
      }
    }

    return {
      authStore,
      registerForm,
      handleRegister,
      isFormValid
    }
  }
}
</script>
