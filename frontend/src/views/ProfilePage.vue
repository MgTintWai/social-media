<template>
  <div class="profile-page">
    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <div class="navbar-brand d-flex align-items-center">
          <div class="brand-icon me-2">S</div>
          <span class="fw-bold">Social</span>
        </div>
        
        <div class="navbar-nav ms-auto d-flex flex-row align-items-center">
          <router-link to="/home" class="nav-link me-3">
            <i class="bi bi-house"></i> Home
          </router-link>
          <router-link to="/profile" class="nav-link me-3">
            <i class="bi bi-person-fill"></i> Profile
          </router-link>
          <div class="dropdown">
            <button class="btn btn-link nav-link dropdown-toggle d-flex align-items-center" 
                    data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="userAvatar" alt="Profile" class="rounded-circle me-2" width="32" height="32">
              {{ authStore.user?.username || 'alex_dev' }}
            </button>
            <ul class="dropdown-menu">
              <li><button class="dropdown-item" @click="logout">Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Profile Header Card -->
          <div class="card mb-4">
            <div class="card-body text-center py-5">
              <h2 class="mb-4">Profile</h2>
              
              <div class="profile-avatar mb-4">
                <img :src="userAvatar" alt="Profile Picture" class="rounded-circle" width="120" height="120">
              </div>
              
              <h3 class="mb-2">{{ authStore.user?.username || 'alex_dev' }}</h3>
              <p class="text-muted mb-4">{{ authStore.user?.email || 'demo@example.com' }}</p>
              
              <div class="row text-center">
                <div class="col-4">
                  <div class="stat-number">{{ userPosts.length }}</div>
                  <div class="stat-label">Posts</div>
                </div>
                <div class="col-4">
                  <div class="stat-number">{{ totalLikes }}</div>
                  <div class="stat-label">Likes</div>
                </div>
                <div class="col-4">
                  <div class="stat-number">{{ totalComments }}</div>
                  <div class="stat-label">Comments</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Your Posts Section -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Your Posts</h5>
            </div>
            <div class="card-body">
              <div v-if="userPosts.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-file-post display-4 mb-3"></i>
                <p>No posts yet. Share your first post!</p>
                <router-link to="/home" class="btn btn-primary">Create Post</router-link>
              </div>
              
              <div v-else>
                <div v-for="post in userPosts" :key="post.id" class="post-item mb-4 pb-4 border-bottom">
                  <div class="d-flex align-items-start justify-content-between">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2">
                        <img :src="userAvatar" alt="Profile" class="rounded-circle me-3" width="32" height="32">
                        <div>
                          <span class="fw-semibold">{{ authStore.user?.username || 'alex_dev' }}</span>
                          <div class="text-muted small">{{ post.timeAgo }}</div>
                        </div>
                      </div>
                      
                      <p class="mb-3">{{ post.content }}</p>
                      
                      <div v-if="post.image" class="mb-3">
                        <img v-if="!post.mediaType || post.mediaType === 'image'" 
                             :src="post.image" 
                             alt="Post image" 
                             class="img-fluid rounded" 
                             style="max-height: 300px; width: 100%; object-fit: cover;">
                        <video v-else-if="post.mediaType === 'video'" 
                               :src="post.image" 
                               class="img-fluid rounded" 
                               style="max-height: 300px; width: 100%; object-fit: cover;"
                               controls>
                        </video>
                      </div>
                      
                      <div class="d-flex align-items-center text-muted">
                        <button 
                          class="btn btn-link text-muted p-1 me-3 like-btn"
                          :class="{ 'liked': post.isLiked }"
                          @click="toggleLike(post)">
                          <i class="bi me-1" :class="post.isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
                          {{ post.likes }}
                        </button>
                        <span class="me-3">
                          <i class="bi bi-chat me-1"></i>
                          {{ post.comments }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="dropdown">
                      <button class="btn btn-link text-muted" data-bs-toggle="dropdown">
                        <i class="bi bi-trash"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><button class="dropdown-item text-danger" @click="deletePost(post.id)">Delete Post</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'ProfilePage',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const userPosts = reactive([
      {
        id: 1,
        content: 'Just deployed our new microservices architecture and we\'re seeing 40% faster load times across all applications. The migration took 3 months but the performance gains are worth every late night. Next up: implementing AI-powered caching strategies.',
        timeAgo: '12h ago',
        likes: 2,
        comments: 0,
        image: null
      }
    ])

    const userAvatar = computed(() => {
      return authStore.user?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    })

    const totalLikes = computed(() => {
      return userPosts.reduce((total, post) => total + post.likes, 0)
    })

    const totalComments = computed(() => {
      return userPosts.reduce((total, post) => total + post.comments, 0)
    })

    const deletePost = (postId) => {
      const index = userPosts.findIndex(post => post.id === postId)
      if (index > -1) {
        userPosts.splice(index, 1)
      }
    }

    const logout = () => {
      authStore.logout()
      router.push('/')
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/')
      }
    })

    return {
      authStore,
      userPosts,
      userAvatar,
      totalLikes,
      totalComments,
      deletePost,
      logout
    }
  }
}
</script>

<style scoped>
.brand-icon {
  width: 32px;
  height: 32px;
  background: #333;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.nav-link {
  color: #666 !important;
  text-decoration: none;
}

.nav-link:hover {
  color: #333 !important;
}

.dropdown-toggle::after {
  display: none;
}

.profile-avatar img {
  border: 4px solid #f8f9fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.btn-link {
  border: none;
  background: none;
  color: #666;
  padding: 4px 8px;
}

.btn-link:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  color: #333;
}
</style>
