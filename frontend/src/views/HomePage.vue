<template>
  <div class="home-page">
    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <div class="navbar-brand d-flex align-items-center">
          <div class="brand-icon me-2">S</div>
          <span class="fw-bold">Social</span>
        </div>
        
        <div class="navbar-nav ms-auto d-flex flex-row align-items-center">
          <router-link to="/home" class="nav-link me-3">
            <i class="bi bi-house-fill"></i> Home
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
      <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8 mx-auto">
          <!-- Create Post Card -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <img :src="userAvatar" alt="Profile" class="rounded-circle me-3" width="40" height="40">
                <span class="fw-semibold">Create a post</span>
              </div>
              
              <form @submit.prevent="createPost">
                <div class="mb-3">
                  <textarea 
                    class="form-control border-0" 
                    rows="3" 
                    placeholder="What's happening in your world?"
                    v-model="newPost.content"
                    style="resize: none;"
                  ></textarea>
                </div>

                <!-- Media Upload Component -->
                <MediaUpload 
                  @media-uploaded="onMediaUploaded"
                  @media-removed="onMediaRemoved"
                  maxPreviewHeight="200px" />
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <div></div>
                  <div class="text-muted small me-3">{{ newPost.content.length }}/280</div>
                </div>
                
                <hr>
                
                <div class="d-flex justify-content-end">
                  <button 
                    type="submit" 
                    class="btn btn-dark px-4"
                    :disabled="!canPost"
                  >
                    Share Post
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Posts Feed -->
          <div v-for="post in posts" :key="post.id" class="card mb-4">
            <div class="card-body">
              <div class="d-flex align-items-start">
                <img :src="post.author.avatar" alt="Profile" class="rounded-circle me-3" width="40" height="40">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center mb-2">
                    <span class="fw-semibold me-2">{{ post.author.username }}</span>
                    <span class="text-muted small">{{ post.timeAgo }}</span>
                  </div>
                  
                  <p class="mb-3">{{ post.content }}</p>
                  
                  <div v-if="post.image" class="mb-3">
                    <img v-if="!post.mediaType || post.mediaType === 'image'" 
                         :src="post.image" 
                         alt="Post image" 
                         class="img-fluid rounded" 
                         style="max-height: 400px; width: 100%; object-fit: cover;">
                    <video v-else-if="post.mediaType === 'video'" 
                           :src="post.image" 
                           class="img-fluid rounded" 
                           style="max-height: 400px; width: 100%; object-fit: cover;"
                           controls>
                    </video>
                  </div>
                  
                  <div class="d-flex align-items-center justify-content-between text-muted">
                    <button 
                      class="btn btn-link text-muted p-1 d-flex align-items-center like-btn"
                      :class="{ 'liked': post.isLiked }"
                      @click="toggleLike(post)">
                      <i class="bi me-1" :class="post.isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
                      <span>{{ post.likes }}</span>
                    </button>
                    <button 
                      class="btn btn-link text-muted p-1 d-flex align-items-center"
                      @click="toggleComments(post)">
                      <i class="bi bi-chat me-1"></i>
                      <span>{{ post.comments }}</span>
                    </button>
                    <button class="btn btn-link text-muted p-1">
                      <i class="bi bi-share"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Comments Section -->
              <div v-if="post.showComments" class="mt-3 pt-3 border-top">
                <div v-for="comment in post.commentsList" :key="comment.id" class="d-flex align-items-start mb-2">
                  <img :src="comment.author.avatar" alt="Profile" class="rounded-circle me-2" width="24" height="24">
                  <div class="flex-grow-1">
                    <div class="bg-light rounded-3 p-2 small">
                      <span class="fw-semibold">{{ comment.author.username }}</span>
                      <span class="ms-1">{{ comment.content }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex align-items-center mt-2">
                  <img :src="userAvatar" alt="Profile" class="rounded-circle me-2" width="24" height="24">
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    placeholder="Write a comment..."
                    @keyup.enter="addComment(post, $event)"
                  >
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
import { useMediaStore } from '../stores/media'
import { useRouter } from 'vue-router'
import MediaUpload from '../components/MediaUpload.vue'

export default {
  name: 'HomePage',
  components: {
    MediaUpload
  },
  setup() {
    const authStore = useAuthStore()
    const mediaStore = useMediaStore()
    const router = useRouter()

    const newPost = reactive({
      content: '',
      mediaFile: null
    })

    const canPost = computed(() => {
      return (newPost.content.trim() || newPost.mediaFile) && 
             newPost.content.length <= 280
    })

    const posts = reactive([
      {
        id: 1,
        author: {
          username: 'mike_digital',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        content: 'Just wrapped up a 6-month digital transformation project for a Fortune 500 company. The journey from legacy systems to modern, user-centric design has been incredible. Sometimes the biggest changes start with the smallest details.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
        mediaType: 'image',
        timeAgo: '2h ago',
        likes: 2,
        comments: 1,
        isLiked: false,
        showComments: true,
        commentsList: [
          {
            id: 1,
            author: {
              username: 'sarah_creative',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c9c0?w=100&h=100&fit=crop&crop=face'
            },
            content: 'Congratulations! Digital transformation is never easy. What was the biggest challenge?'
          }
        ]
      },
      {
        id: 2,
        author: {
          username: 'lisa_ux',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        },
        content: 'UX principle reminder: Your users don\'t care how clever your design is—they care about whether it solves their problem. Today I removed 3 features from a product because they were adding complexity without adding value. Sometimes less really is more.',
        timeAgo: '3h ago',
        likes: 8,
        comments: 1,
        isLiked: false,
        showComments: false,
        commentsList: []
      },
      {
        id: 3,
        author: {
          username: 'alex_dev',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        content: 'Just deployed our new microservices architecture and we\'re seeing 40% faster load times across all applications. The migration took 3 months but the performance gains are worth every late night. Next up: implementing AI-powered caching strategies.',
        timeAgo: '5h ago',
        likes: 2,
        comments: 0,
        isLiked: false,
        showComments: false,
        commentsList: []
      },
      {
        id: 4,
        author: {
          username: 'tech_sarah',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c9c0?w=100&h=100&fit=crop&crop=face'
        },
        content: 'Demo video: New AI-powered code review tool in action! This is going to change how we handle pull requests. 🚀',
        image: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        mediaType: 'video',
        timeAgo: '1d ago',
        likes: 15,
        comments: 3,
        isLiked: false,
        showComments: false,
        commentsList: []
      }
    ])

    const userAvatar = computed(() => {
      return authStore.user?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    })

    const createPost = () => {
      if (!newPost.content.trim() && !newPost.mediaFile) return

      const post = {
        id: Date.now(),
        author: {
          username: authStore.user?.username || 'alex_dev',
          avatar: userAvatar.value
        },
        content: newPost.content,
        image: newPost.mediaFile?.url || null,
        mediaType: newPost.mediaFile?.mediaType || null,
        timeAgo: 'now',
        likes: 0,
        comments: 0,
        isLiked: false,
        showComments: false,
        commentsList: []
      }

      posts.unshift(post)
      
      // Reset form
      newPost.content = ''
      newPost.mediaFile = null
      
      // Clear media store
      if (newPost.mediaFile) {
        mediaStore.removeFile(newPost.mediaFile.id)
      }
    }

    const toggleLike = (post) => {
      if (post.isLiked) {
        post.likes--
        post.isLiked = false
      } else {
        post.likes++
        post.isLiked = true
      }
    }

    const toggleComments = (post) => {
      post.showComments = !post.showComments
    }

    const onMediaUploaded = (uploadedFile) => {
      newPost.mediaFile = uploadedFile
    }

    const onMediaRemoved = () => {
      newPost.mediaFile = null
    }

    const addComment = (post, event) => {
      const content = event.target.value.trim()
      if (!content) return

      const comment = {
        id: Date.now(),
        author: {
          username: authStore.user?.username || 'alex_dev',
          avatar: userAvatar.value
        },
        content: content
      }

      post.commentsList.push(comment)
      post.comments++
      post.showComments = true
      event.target.value = ''
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
      mediaStore,
      newPost,
      posts,
      userAvatar,
      canPost,
      createPost,
      toggleLike,
      toggleComments,
      onMediaUploaded,
      onMediaRemoved,
      addComment,
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

.like-btn {
  transition: all 0.2s ease;
  border: none !important;
  text-decoration: none !important;
}

.like-btn:hover {
  color: #e91e63 !important;
  background: rgba(233, 30, 99, 0.1) !important;
  border-radius: 8px !important;
}

.like-btn.liked {
  color: #e91e63 !important;
}

.like-btn.liked:hover {
  color: #c2185b !important;
}

.like-btn i {
  transition: all 0.2s ease;
}

.like-btn.liked i {
  animation: heartPulse 0.3s ease;
}

@keyframes heartPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.btn-link:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}
</style>
