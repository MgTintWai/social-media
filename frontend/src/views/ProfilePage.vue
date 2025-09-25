<template>
  <div class="profile-page">
    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
      <div class="container">
        <div class="navbar-nav justify-content-center flex-grow-1 d-flex flex-row align-items-center">
          <div class="navbar-brand d-flex align-items-center me-4">
            <div class="brand-icon me-2">S</div>
            <span class="fw-bold">Social</span>
          </div>
          <router-link to="/home" class="nav-link me-4 d-flex align-items-center">
            <i class="bi bi-house-fill me-1"></i> Home
          </router-link>
          <router-link to="/profile" class="nav-link d-flex align-items-center">
            <i class="bi bi-person-fill me-1"></i> Profile
          </router-link>
        </div>

        <div class="navbar-nav d-flex flex-row align-items-center">
          <div class="d-flex align-items-center">
            <img :src="userAvatar" alt="Profile" class="rounded-circle me-2" width="32" height="32">
            <span class="me-3 fw-medium text-dark">{{ authStore.user?.name || 'User' }}</span>
            <button class="btn btn-outline-secondary btn-sm" @click="logout">
              <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container main-content">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Profile Header Card -->
          <div class="card mb-4">
            <div class="card-body text-center py-5">
              <h2 class="mb-4">Profile</h2>
              
              <div class="profile-avatar mb-4">
                <img :src="userAvatar" alt="Profile Picture" class="rounded-circle" width="120" height="120">
              </div>
              
              <h3 class="mb-2">{{ profileData?.name || authStore.user?.name || 'Loading...' }}</h3>
              <p class="text-muted mb-4">{{ profileData?.email || authStore.user?.email || 'Loading...' }}</p>
              
              <div class="row text-center">
                <div class="col-4">
                  <div class="stat-number">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <span v-else>{{ profileData?.post_count || 0 }}</span>
                  </div>
                  <div class="stat-label">Posts</div>
                </div>
                <div class="col-4">
                  <div class="stat-number">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <span v-else>{{ totalLikes }}</span>
                  </div>
                  <div class="stat-label">Likes</div>
                </div>
                <div class="col-4">
                  <div class="stat-number">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <span v-else>{{ totalComments }}</span>
                  </div>
                  <div class="stat-label">Comments</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Your Posts Section -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Your Posts</h5>
              <span v-if="postsLoading" class="spinner-border spinner-border-sm" role="status"></span>
            </div>
            <div class="card-body">
              <div v-if="postsLoading" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading your posts...</p>
              </div>
              
              <div v-else-if="userPosts.length === 0" class="text-center py-5 text-muted">
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
                          <span class="fw-semibold">{{ authStore.user?.name || 'User' }}</span>
                          <div class="text-muted small">{{ post.timeAgo }}</div>
                        </div>
                      </div>
                      
                      <h6 v-if="post.title" class="mb-2 fw-semibold">{{ post.title }}</h6>
                      <p class="mb-3">{{ post.content }}</p>
                      
                      <div v-if="post.image || post.media_url" class="mb-3">
                        <img v-if="!post.media_type || post.media_type === 'image'" 
                             :src="post.media_url || post.image" 
                             alt="Post media" 
                             class="img-fluid rounded" 
                             style="max-height: 300px; width: 100%; object-fit: cover;">
                        <video v-else-if="post.media_type === 'video'" 
                               :src="post.media_url || post.image" 
                               class="img-fluid rounded" 
                               style="max-height: 300px; width: 100%; object-fit: cover;"
                               controls
                               preload="metadata">
                          Your browser does not support the video tag.
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
                        <button 
                          class="btn btn-link text-muted p-1 me-3"
                          @click="toggleComments(post)">
                          <i class="bi bi-chat me-1"></i>
                          {{ post.comments }}
                        </button>
                      </div>

                      <!-- Comments Section -->
                      <div v-if="post.showComments" class="mt-3 pt-3 border-top">
                        <!-- Existing Comments -->
                        <div v-if="post.commentsList && post.commentsList.length > 0" class="mb-4">
                          <div v-for="comment in post.commentsList" :key="comment.id" class="d-flex align-items-start mb-3 comment-item">
                            <div class="comment-avatar me-3">
                              <div class="avatar-circle d-flex align-items-center justify-content-center">
                                {{ comment.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                              </div>
                            </div>
                            <div class="flex-grow-1">
                              <div class="comment-bubble">
                                <div class="d-flex align-items-center mb-2">
                                  <span class="comment-author">{{ comment.user?.name || 'Anonymous' }}</span>
                                  <span class="comment-time">{{ comment.created_at_human || formatTimeAgo(comment.created_at) }}</span>
                                </div>
                                <p class="comment-text">{{ comment.content }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Add Comment Input -->
                        <div class="d-flex align-items-center">
                          <div class="comment-input-section flex-grow-1">
                            <div class="d-flex align-items-center">
                              <div class="comment-avatar me-3">
                                <img :src="userAvatar" alt="Your avatar" class="user-avatar">
                              </div>
                              <div class="flex-grow-1 position-relative">
                                <input 
                                  type="text" 
                                  class="comment-input-field" 
                                  placeholder="Write a comment..."
                                  v-model="post.newComment"
                                  @keyup.enter="addComment(post)"
                                >
                              </div>
                            </div>
                          </div>
                          <button 
                            class="send-button ms-3"
                            @click="addComment(post)"
                            :disabled="!post.newComment?.trim()">
                            <i class="bi bi-send"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="dropdown">
                      <button class="btn btn-link text-muted" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><button class="dropdown-item text-danger" @click="deletePost(post.id)">Delete Post</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Posts Pagination -->
              <PaginationComponent
                v-if="userPosts.length > 0 && postsPagination.totalPages > 1"
                :current-page="postsPagination.currentPage"
                :total-pages="postsPagination.totalPages"
                :total="postsPagination.total"
                :per-page="postsPagination.perPage"
                :has-more-pages="postsPagination.hasMorePages"
                :loading="postsLoading"
                mode="loadMore"
                item-type="posts"
                @load-more="loadMoreMyPosts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import PaginationComponent from '../components/PaginationComponent.vue'
import ApiService from '../services/api.js'

export default {
  name: 'ProfilePage',
  components: {
    PaginationComponent
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const profileData = ref(null)
    const isLoading = ref(true)
    const error = ref(null)
    const userPosts = ref([])
    const postsLoading = ref(false)
    const postsPagination = ref({
      currentPage: 1,
      totalPages: 1,
      perPage: 10,
      total: 0,
      hasMorePages: false
    })

    const userAvatar = computed(() => {
      // Try multiple possible property names for profile picture
      return authStore.user?.profile_picture || 
             authStore.user?.profilePicture || 
             profileData.value?.profile_picture ||
             'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    })

    const totalLikes = computed(() => {
      return profileData.value?.reaction_count || 0
    })

    const totalComments = computed(() => {
      return profileData.value?.comment_count || 0
    })

    const fetchProfile = async () => {
      try {
        isLoading.value = true
        const response = await ApiService.getProfile()
        
        if (response.success) {
          profileData.value = response.data
          // Update auth store user data with fresh profile info
          if (authStore.user) {
            authStore.user.profile_picture = response.data.profile_picture
            localStorage.setItem('auth_user', JSON.stringify(authStore.user))
          }
        } else {
          error.value = 'Failed to load profile data'
        }
      } catch (err) {
        error.value = err.message
        console.error('Profile fetch error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const fetchMyPosts = async (page = 1, perPage = 10, append = false) => {
      try {
        postsLoading.value = true
        const response = await ApiService.getMyPosts(page, perPage)
        
        const mappedPosts = (response.data || []).map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          image: post.image, // Backward compatibility
          media_url: post.media_url,
          media_type: post.media_type,
          timeAgo: post.created_at_human || new Date(post.created_at).toLocaleDateString(),
          likes: post.reaction_count || 0,
          comments: post.comment_count || 0,
          isLiked: post.user_has_reacted || false,
          showComments: false,
          commentsList: [],
          commentsLoaded: false,
          newComment: ''
        }))
        
        if (append && page > 1) {
          // Append new posts for load more
          userPosts.value = [...userPosts.value, ...mappedPosts]
        } else {
          // Replace posts for initial load
          userPosts.value = mappedPosts
        }
        
        // Update pagination info
        if (response.meta) {
          postsPagination.value = {
            currentPage: response.meta.current_page,
            totalPages: response.meta.last_page,
            perPage: response.meta.per_page,
            total: response.meta.total,
            hasMorePages: response.meta.current_page < response.meta.last_page
          }
        }
      } catch (err) {
        console.error('Posts fetch error:', err)
      } finally {
        postsLoading.value = false
      }
    }

    const loadMoreMyPosts = async () => {
      if (postsPagination.value.hasMorePages && !postsLoading.value) {
        await fetchMyPosts(postsPagination.value.currentPage + 1, 10, true)
      }
    }

    const toggleLike = async (post) => {
      try {
        const response = await ApiService.toggleReaction(post.id,'like')
        if (response.success) {
          // Update the post object directly for immediate UI update
          post.isLiked = response.data.user_has_reacted
          post.likes = response.data.reaction_count
          
          // Also update in the array to maintain consistency
          const index = userPosts.value.findIndex(p => p.id === post.id)
          if (index !== -1) {
            userPosts.value[index].isLiked = response.data.user_has_reacted
            userPosts.value[index].likes = response.data.reaction_count
          }
        }
      } catch (error) {
        console.error('Error toggling like:', error)
      }
    }

    const toggleComments = async (post) => {
      if (!post.showComments) {
        // Show comments and load them if not already loaded
        post.showComments = true
        if (!post.commentsLoaded) {
          try {
            const response = await ApiService.getPostComments(post.id)
            if (response.success) {
              post.commentsList = response.data
              post.commentsLoaded = true
            }
          } catch (error) {
            console.error('Error loading comments:', error)
          }
        }
      } else {
        // Hide comments
        post.showComments = false
      }
    }

    const addComment = async (post) => {
      const content = post.newComment?.trim()
      if (!content) return

      try {
        const response = await ApiService.createComment(post.id, { content })
        if (response.success) {
          // Initialize commentsList if it doesn't exist
          if (!post.commentsList) {
            post.commentsList = []
          }

          // Add the new comment to the list
          post.commentsList.unshift(response.data)
          
          // Update comment count
          post.comments = (post.comments || 0) + 1
          
          // Make sure comments are visible
          post.showComments = true
          post.commentsLoaded = true
          
          // Clear the input
          post.newComment = ''
        }
      } catch (error) {
        console.error('Error creating comment:', error)
        alert('Failed to post comment')
      }
    }

    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'now'
    }

    const deletePost = async (postId) => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          const response = await ApiService.deletePost(postId)
          if (response.success) {
            const index = userPosts.value.findIndex(post => post.id === postId)
            if (index > -1) {
              userPosts.value.splice(index, 1)
            }
            // Refresh profile data to update post count
            fetchProfile()
          }
        } catch (error) {
          console.error('Error deleting post:', error)
          alert('Failed to delete post')
        }
      }
    }

    const logout = async () => {
      await authStore.logout()
      await router.replace('/')
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/')
      } else {
        fetchProfile()
        fetchMyPosts()
      }
    })

    return {
      authStore,
      userPosts,
      userAvatar,
      totalLikes,
      totalComments,
      postsPagination,
      toggleLike,
      toggleComments,
      addComment,
      formatTimeAgo,
      deletePost,
      logout,
      profileData,
      isLoading,
      postsLoading,
      error,
      fetchProfile,
      fetchMyPosts,
      loadMoreMyPosts
    }
  }
}
</script>

<style scoped>
.navbar {
  z-index: 1000;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: white;
}

.nav-link {
  color: #333 !important;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.nav-link:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea !important;
}

.nav-link.router-link-active {
  background-color: rgba(102, 126, 234, 0.15);
  color: #667eea !important;
  font-weight: 600;
}

.dropdown-toggle {
  border: none;
  text-decoration: none;
  color: #333 !important;
}

.dropdown-toggle::after {
  margin-left: 0.5em;
}

.btn-link.nav-link {
  border: none;
  text-decoration: none;
}

.btn-link.nav-link:hover {
  text-decoration: none;
  background-color: rgba(102, 126, 234, 0.1);
}

.main-content {
  margin-top: 80px;
  padding-top: 20px;
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

.like-btn.liked {
  color: #dc3545 !important;
}

.like-btn:hover {
  color: #dc3545 !important;
}

.comment-avatar {
  flex-shrink: 0;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn:disabled {
  opacity: 0.4;
}

/* Enhanced Comment Styles */
.comment-item {
  transition: all 0.2s ease;
}

.comment-item:hover {
  transform: translateY(-1px);
}

.avatar-circle {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.comment-bubble {
  background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 12px 16px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  position: relative;
}

.comment-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #f8f9fa;
}

.comment-author {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.comment-time {
  color: #6c757d;
  font-size: 12px;
  margin-left: 8px;
}

.comment-text {
  margin: 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.4;
}

.comment-input-section {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.comment-input-field {
  width: 100%;
  border: none;
  background: transparent;
  padding: 12px 16px;
  font-size: 14px;
  color: #495057;
  outline: none;
  border-radius: 20px;
}

.comment-input-field::placeholder {
  color: #adb5bd;
  font-style: italic;
}

.send-button {
  width: 42px;
  height: 42px;
  border: none;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.send-button:active {
  transform: translateY(0) scale(0.98);
}

.send-button:disabled {
  background: #e9ecef;
  color: #adb5bd;
  box-shadow: none;
  cursor: not-allowed;
}

/* Mobile Responsive Design */

/* iPhone XR (414x896) */
@media only screen and (max-width: 414px) and (max-height: 896px) {
  .container {
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .main-content {
    margin-top: 70px;
    padding-top: 10px;
  }
  
  .navbar .container {
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .navbar-nav .nav-link {
    padding: 0.3rem 0.6rem;
    font-size: 0.9rem;
  }
  
  .brand-icon {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  .profile-avatar img {
    width: 100px !important;
    height: 100px !important;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
  }
}

/* iPhone 12 PRO (390x844) */
@media only screen and (max-width: 390px) and (max-height: 844px) {
  .container {
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .main-content {
    margin-top: 68px;
    padding-top: 8px;
  }
  
  .profile-avatar img {
    width: 90px !important;
    height: 90px !important;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .post-item {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }
}

/* iPhone 14 PRO Max (430x932) */
@media only screen and (max-width: 430px) and (max-height: 932px) {
  .container {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .main-content {
    margin-top: 75px;
    padding-top: 12px;
  }
  
  .profile-avatar img {
    width: 110px !important;
    height: 110px !important;
  }
}

/* General Mobile Styles (All devices under 768px) */
@media (max-width: 767.98px) {
  /* Navigation adjustments */
  .navbar {
    padding: 0.5rem 0;
  }
  
  .navbar-nav {
    gap: 0.25rem;
  }
  
  .navbar-nav .d-flex.flex-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .nav-link {
    white-space: nowrap;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  /* Profile section adjustments */
  .card-body.text-center.py-5 {
    padding: 2rem 1rem !important;
  }
  
  .profile-avatar {
    margin-bottom: 1.5rem !important;
  }
  
  .row.text-center .col-4 {
    margin-bottom: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
  }
  
  /* Posts section */
  .col-lg-8 {
    max-width: 100%;
    padding: 0;
  }
  
  .post-item {
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    background: white;
  }
  
  .post-item h6 {
    font-size: 1rem;
    line-height: 1.4;
  }
  
  .post-item p {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  /* Media display */
  .img-fluid, video {
    border-radius: 12px;
    max-height: 300px !important;
  }
  
  /* Action buttons */
  .btn-link {
    padding: 0.5rem 0.25rem;
    font-size: 0.875rem;
  }
  
  .like-btn, .btn-link.text-muted {
    min-width: 60px;
    justify-content: center;
  }
  
  /* Comments section */
  .comment-input-section {
    padding: 10px;
    border-radius: 15px;
  }
  
  .comment-bubble {
    border-radius: 12px;
    padding: 10px 12px;
  }
  
  .send-button {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }
  
  /* Dropdown menus */
  .dropdown-menu {
    font-size: 0.875rem;
  }
  
  /* Pagination */
  .btn-load-more {
    width: 100%;
    max-width: none;
    margin: 0 10px;
  }
}

/* Extra small devices */
@media (max-width: 575.98px) {
  .navbar-brand {
    margin-right: 0.5rem;
  }
  
  .brand-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .navbar-brand span {
    font-size: 1rem;
  }
  
  .main-content {
    padding-top: 8px;
  }
  
  .card-body {
    padding: 0.75rem;
  }
  
  .profile-avatar img {
    width: 80px !important;
    height: 80px !important;
  }
  
  .row.text-center {
    margin: 0;
  }
  
  .row.text-center .col-4 {
    padding: 0.5rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  /* Profile images */
  img[width="32"][height="32"] {
    width: 28px !important;
    height: 28px !important;
  }
  
  .post-item {
    margin: 0 -5px 1rem -5px;
  }
}

/* Landscape orientation adjustments */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .main-content {
    margin-top: 60px;
  }
  
  .navbar {
    padding: 0.25rem 0;
  }
  
  .card-body.text-center.py-5 {
    padding: 1.5rem 1rem !important;
  }
  
  .profile-avatar {
    margin-bottom: 1rem !important;
  }
  
  .profile-avatar img {
    width: 70px !important;
    height: 70px !important;
  }
}

/* Touch-specific improvements */
@media (hover: none) and (pointer: coarse) {
  .btn, .nav-link, .dropdown-toggle {
    min-height: 44px; /* iOS recommended touch target */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .like-btn, .btn-link.text-muted {
    min-height: 44px;
    min-width: 44px;
    border-radius: 8px;
  }
  
  .comment-input-field {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .send-button {
    min-width: 44px;
    min-height: 44px;
  }
  
  .dropdown-toggle {
    padding: 0.5rem;
    min-width: 44px;
  }
}

/* Dark mode support for mobile */
@media (prefers-color-scheme: dark) and (max-width: 767.98px) {
  .card {
    background-color: #1a1a1a;
    border-color: #333;
  }
  
  .post-item {
    background-color: #1a1a1a;
    border-color: #333;
  }
  
  .comment-bubble {
    background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);
    border-color: #333;
  }
  
  .comment-input-section {
    background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);
    border-color: #333;
  }
  
  .stat-number {
    color: #e9ecef;
  }
  
  .stat-label {
    color: #adb5bd;
  }
}

/* Accessibility improvements for mobile */
@media (max-width: 767.98px) {
  /* Ensure sufficient contrast */
  .text-muted {
    color: #666 !important;
  }
  
  /* Improve focus indicators */
  .btn:focus,
  .nav-link:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  /* Prevent horizontal scrolling */
  body {
    overflow-x: hidden;
  }
  
  /* Improve readability */
  p, .comment-text {
    line-height: 1.6;
  }
  
  /* Profile stats grid improvements */
  .row.text-center .col-4 {
    border-right: 1px solid #e9ecef;
  }
  
  .row.text-center .col-4:last-child {
    border-right: none;
  }
}
</style>
