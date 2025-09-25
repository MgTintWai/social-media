import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import HomePage from '../views/HomePage.vue'
import ProfilePage from '../views/ProfilePage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Check if user has a valid token
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Try to authenticate with existing token
        const isValid = await authStore.checkAuth()
        if (isValid) {
          next()
        } else {
          next('/')
        }
      } else {
        next('/')
      }
    } else {
      next()
    }
  }
  // Check if route requires guest (not authenticated)
  else if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      next('/home')
    } else {
      next()
    }
  }
  // No restrictions
  else {
    next()
  }
})

export default router
