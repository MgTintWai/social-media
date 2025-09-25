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
              <label for="email" class="form-label text-start d-block">Email</label>
              <input 
                type="email" 
                id="email"
                class="form-control" 
                :class="{ 'is-invalid': formErrors.email }"
                placeholder="Enter your email"
                v-model="loginForm.email"
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
                placeholder="Enter your password"
                v-model="loginForm.password"
              />
              <div v-if="formErrors.password" class="error-message mt-2">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.password }}
              </div>
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

    const formErrors = reactive({
      email: '',
      password: ''
    })

    const validateForm = () => {
      // Clear previous errors
      formErrors.email = ''
      formErrors.password = ''
      
      let isValid = true

      // Validate email
      if (!loginForm.email.trim()) {
        formErrors.email = 'Email is required.'
        isValid = false
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(loginForm.email)) {
          formErrors.email = 'Please enter a valid email address.'
          isValid = false
        }
      }

      // Validate password
      if (!loginForm.password) {
        formErrors.password = 'Password is required.'
        isValid = false
      }

      return isValid
    }

    const handleLogin = async () => {
      authStore.clearError()
      
      if (!validateForm()) {
        return
      }
      
      const result = await authStore.login({
        email: loginForm.email,
        password: loginForm.password
      })

      if (result.success) {
        // Redirect to home page
        router.push('/home')
      } else {
        // Handle server validation errors
        if (result.errors) {
          if (result.errors.email) formErrors.email = result.errors.email[0]
          if (result.errors.password) formErrors.password = result.errors.password[0]
        }
      }
    }

    return {
      authStore,
      loginForm,
      formErrors,
      handleLogin
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

/* Mobile Responsive Design */

/* Large mobile devices (up to 430px) - iPhone 14 Pro Max and similar */
@media only screen and (max-width: 430px) {
  .gradient-background {
    padding: 1rem 0.75rem;
    min-height: 100vh;
    min-height: 100svh; /* Use small viewport height */
  }
  
  .auth-container {
    max-width: 390px;
    width: 100%;
  }
  
  .auth-card {
    padding: 1.75rem 1.5rem;
    border-radius: 16px;
    margin: 0 auto;
  }
  
  .app-title {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .auth-tabs {
    margin-bottom: 1.5rem;
  }
  
  .auth-tab {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
  
  .form-control {
    padding: 0.875rem 1rem;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 10px;
  }
  
  .btn-primary {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    border-radius: 10px;
  }
  
  .demo-info {
    margin-top: 1.5rem;
    padding: 1rem;
    font-size: 0.875rem;
  }
}

/* Medium mobile devices (up to 414px) - iPhone XR and similar */
@media only screen and (max-width: 414px) {
  .gradient-background {
    padding: 1rem 0.5rem;
  }
  
  .auth-container {
    max-width: 380px;
  }
  
  .auth-card {
    padding: 1.5rem 1.25rem;
  }
  
  .app-title {
    font-size: 2.1rem;
  }
  
  .app-subtitle {
    font-size: 0.95rem;
  }
}

/* Standard mobile devices (up to 390px) - iPhone 12 PRO and similar */
@media only screen and (max-width: 390px) {
  .gradient-background {
    padding: 0.75rem 0.5rem;
  }
  
  .auth-container {
    max-width: 360px;
  }
  
  .auth-card {
    padding: 1.25rem 1rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .app-subtitle {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }
  
  .auth-content h3 {
    font-size: 1.25rem;
  }
}

/* iPhone SE and smaller devices (375px and below) */
@media only screen and (max-width: 375px) {
  .gradient-background {
    padding: 0.5rem 0.25rem;
  }
  
  .auth-container {
    max-width: 340px;
  }
  
  .auth-card {
    padding: 1rem 0.875rem;
    border-radius: 12px;
  }
  
  .app-title {
    font-size: 1.875rem;
  }
  
  .app-subtitle {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .auth-tabs {
    margin-bottom: 1.25rem;
  }
  
  .auth-tab {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .form-control {
    padding: 0.75rem 0.875rem;
    font-size: 16px;
  }
  
  .btn-primary {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
  
  .demo-info {
    margin-top: 1.25rem;
    padding: 0.875rem;
    font-size: 0.8rem;
  }
}

/* General mobile styles (up to 767px) - Ensures 100% size compatibility */
@media (max-width: 767.98px) {
  .gradient-background {
    align-items: center;
    padding: 1.5rem 1rem;
    min-height: 150vh;
  }
  
  .auth-container {
    width: 100%;
    max-width: 400px;
  }
  
  .auth-card {
    width: 100%;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    margin: 0 auto;
  }
  
  .app-title {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-control {
    padding: 0.875rem 1rem;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 10px;
    min-height: 48px;
  }
  
  .btn-primary {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    border-radius: 10px;
    min-height: 48px;
  }
  
  .form-label {
    font-size: 0.95rem;
    font-weight: 600;
  }
  
  .error-message {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .auth-content {
    text-align: left;
  }
  
  .auth-content h3 {
    text-align: left;
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
  }
  
  .auth-content p {
    text-align: left;
    margin-bottom: 1.5rem;
  }
  
  .auth-tabs {
    margin-bottom: 1.5rem;
  }
  
  .auth-tab {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .demo-info {
    margin-top: 1.5rem;
    padding: 1rem;
    font-size: 0.875rem;
    background: rgba(108, 117, 125, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(108, 117, 125, 0.2);
  }
}

/* Landscape orientation for mobile devices */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .gradient-background {
    padding: 1rem 0.5rem;
    align-items: center;
  }
  
  .auth-card {
    padding: 1rem 1.5rem;
  }
  
  .app-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .app-subtitle {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .auth-tabs {
    margin-bottom: 1rem;
  }
  
  .auth-content h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .auth-content p {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .demo-info {
    margin-top: 1rem;
    padding: 0.75rem;
    font-size: 0.8rem;
  }
}

/* Touch device improvements */
@media (hover: none) and (pointer: coarse) {
  .form-control {
    min-height: 48px; /* Better touch target */
  }
  
  .btn-primary {
    min-height: 48px;
    font-weight: 600;
  }
  
  .auth-tab {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Prevent unwanted hover effects on touch */
  .btn-primary:hover {
    transform: none;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
  }
}

/* High DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  .auth-card {
    backdrop-filter: blur(15px);
  }
  
  .app-title {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Accessibility improvements */
@media (max-width: 767.98px) {
  /* Better focus indicators */
  .form-control:focus,
  .btn:focus,
  .auth-tab:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
  
  /* Improve contrast */
  .form-label {
    color: #2c3e50;
  }
  
  .auth-content p {
    color: #5a6c7d;
  }
}

/* Very tall screens adjustment */
@media (min-height: 900px) and (max-width: 430px) {
  .gradient-background {
    align-items: center;
    padding: 2rem 1rem;
  }
}

/* Safe area support for devices with notches */
@supports (padding-top: env(safe-area-inset-top)) {
  @media (max-width: 430px) {
    .gradient-background {
      padding-top: calc(1rem + env(safe-area-inset-top));
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
      padding-left: calc(0.75rem + env(safe-area-inset-left));
      padding-right: calc(0.75rem + env(safe-area-inset-right));
    }
  }
}
</style>
