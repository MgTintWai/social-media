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
              <label for="name" class="form-label text-start d-block">Full Name</label>
              <input 
                type="text" 
                id="name"
                class="form-control" 
                :class="{ 'is-invalid': formErrors.name }"
                placeholder="Enter your full name"
                v-model="registerForm.name"
                maxlength="255"
              />
              <div v-if="formErrors.name" class="error-message mt-2">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.name }}
              </div>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label text-start d-block">Email</label>
              <input 
                type="email" 
                id="email"
                class="form-control" 
                :class="{ 'is-invalid': formErrors.email }"
                placeholder="Enter your email"
                v-model="registerForm.email"
              />
              <div v-if="formErrors.email" class="error-message mt-2">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.email }}
              </div>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label text-start d-block">Password</label>
              <input 
                type="password" 
                id="password"
                class="form-control" 
                :class="{ 'is-invalid': formErrors.password }"
                placeholder="Create a password (min 8 characters)"
                v-model="registerForm.password"
              />
              <div v-if="formErrors.password" class="error-message mt-2">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.password }}
              </div>
            </div>

            <div class="mb-3">
              <label for="profile_picture" class="form-label text-start d-block">Profile Picture URL (optional)</label>
              <input 
                type="url" 
                id="profile_picture"
                class="form-control" 
                :class="{ 'is-invalid': formErrors.profile_picture }"
                placeholder="https://example.com/your-photo.jpg"
                v-model="registerForm.profile_picture"
              />
              <div v-if="formErrors.profile_picture" class="error-message mt-2">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.profile_picture }}
              </div>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating account...
              </span>
              <span v-else>Create account</span>
            </button>
          </form>
        </div>
                                    <div class="demo-info">
            <strong>Demo account for testing:</strong><br>
            Email: demo@example.com<br>
            Password: demo123
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterPage',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const registerForm = reactive({
      name: '',
      email: '',
      password: '',
      profile_picture: ''
    })

    const formErrors = reactive({
      name: '',
      email: '',
      password: '',
      profile_picture: ''
    })

    const validateForm = () => {
      // Clear previous errors
      formErrors.name = ''
      formErrors.email = ''
      formErrors.password = ''
      formErrors.profile_picture = ''
      
      let isValid = true

      // Validate name
      if (!registerForm.name.trim()) {
        formErrors.name = 'Name is required.'
        isValid = false
      } else if (registerForm.name.length > 255) {
        formErrors.name = 'Name must be 255 characters or less.'
        isValid = false
      }

      // Validate email
      if (!registerForm.email.trim()) {
        formErrors.email = 'Email is required.'
        isValid = false
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(registerForm.email)) {
          formErrors.email = 'Please enter a valid email address.'
          isValid = false
        }
      }

      // Validate password
      if (!registerForm.password) {
        formErrors.password = 'Password is required.'
        isValid = false
      } else if (registerForm.password.length < 8) {
        formErrors.password = 'Password must be at least 8 characters long.'
        isValid = false
      }

      // Validate profile picture URL (optional, but if provided, must be valid)

      return isValid
    }

    const isFormValid = computed(() => {
      return registerForm.name && 
             registerForm.email && 
             registerForm.password && 
             registerForm.password.length >= 8
    })

    const handleRegister = async () => {
      authStore.clearError()

      if (!validateForm()) {
        return
      }

      try {
        const result = await authStore.register({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          profile_picture: registerForm.profile_picture.trim() || null
        })

        if (result.success) {
          console.log('Registration successful!', authStore.user)
          router.push('/home')
        } else {
          // Handle server validation errors
          if (result.errors) {
            if (result.errors.name) formErrors.name = result.errors.name[0]
            if (result.errors.email) formErrors.email = result.errors.email[0]
            if (result.errors.password) formErrors.password = result.errors.password[0]
            if (result.errors.profile_picture) formErrors.profile_picture = result.errors.profile_picture[0]
          }
        }
      } catch (error) {
        console.error('Registration error:', error)
        
        // Handle validation errors from server response
        if (error.response && error.response.data) {
          const errorData = error.response.data
          
          // Check for validation errors
          if (errorData.errors) {
            if (errorData.errors.name) formErrors.name = errorData.errors.name[0]
            if (errorData.errors.email) formErrors.email = errorData.errors.email[0]
            if (errorData.errors.password) formErrors.password = errorData.errors.password[0]
            if (errorData.errors.profile_picture) formErrors.profile_picture = errorData.errors.profile_picture[0]
          }
          
          // If no specific field errors, show general message
          if (!errorData.errors && errorData.message) {
            // If it's an email exists error, show it in the email field
            if (errorData.message.toLowerCase().includes('email') || 
                errorData.message.toLowerCase().includes('already') ||
                errorData.message.toLowerCase().includes('exists')) {
              formErrors.email = errorData.message
            }
          }
        }
      }
    }

    // Watch for real-time validation feedback
    watch(() => registerForm.name, (newName) => {
      if (newName.trim() && formErrors.name) {
        formErrors.name = ''
      }
    })

    watch(() => registerForm.email, (newEmail) => {
      if (newEmail.trim() && formErrors.email) {
        formErrors.email = ''
      }
    })

    watch(() => registerForm.password, (newPassword) => {
      if (newPassword && formErrors.password) {
        formErrors.password = ''
      }
    })

    watch(() => registerForm.profile_picture, (newPicture) => {
      if (formErrors.profile_picture) {
        formErrors.profile_picture = ''
      }
    })

    return {
      authStore,
      registerForm,
      formErrors,
      handleRegister,
      isFormValid
    }
  }
}
</script>

<style scoped>
.gradient-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
}

.auth-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #6c757d;
}

.auth-tab.active {
  background: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-content {
  text-align: left;
}

.form-control {
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  width: 100%;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

/* Custom Error Message Styling */
.error-message {
  color: #dc3545;
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);
  animation: slideInError 0.3s ease-out;
}

.error-message i {
  color: #dc3545;
  font-size: 16px;
}

@keyframes slideInError {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced input error styling */
.form-control.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.form-control.is-invalid:focus {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}
</style>