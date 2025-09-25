<template>
  <div class="home-page">
    <!-- Header -->
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
                  <div class="mb-3">
                    <input 
                      type="text" 
                      class="form-control border-0" 
                      :class="{ 'is-invalid': formErrors.title }"
                      placeholder="Post title"
                      v-model="newPost.title"
                      maxlength="255"
                    />
                    <div v-if="formErrors.title" class="error-message mt-2">
                      <i class="bi bi-exclamation-circle me-1"></i>
                      {{ formErrors.title }}
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <textarea 
                      class="form-control border-0" 
                      :class="{ 'is-invalid': formErrors.content }"
                      rows="3" 
                      placeholder="What's happening in your world?"
                      v-model="newPost.content"
                      maxlength="500"
                      style="resize: none;"
                    ></textarea>
                    <div v-if="formErrors.content" class="error-message mt-2">
                      <i class="bi bi-exclamation-circle me-1"></i>
                      {{ formErrors.content }}
                    </div>
                  </div>
                </div>

                <!-- Media Upload Component -->
                <MediaUpload 
                  ref="mediaUploadRef"
                  @media-uploaded="onMediaUploaded"
                  @media-removed="onMediaRemoved"
                  maxPreviewHeight="200px" />
                
                                <div class="d-flex justify-content-between align-items-center">
                  <div class="text-muted small">
                    <span v-if="newPost.title.length > 0">Title: {{ newPost.title.length }}/255</span>
                    <span v-if="newPost.title.length > 0 && newPost.content.length > 0"> | </span>
                    <span v-if="newPost.content.length > 0">Content: {{ newPost.content.length }}/500</span>
                  </div>
                  
                  <button 
                    type="submit" 
                    class="btn btn-dark px-4"
                    :disabled="!canPost || (postsStore.isLoading && creatingPost)"
                  >
                    <span v-if="postsStore.isLoading && creatingPost">
                      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                      Sharing...
                    </span>
                    <span v-else>Share Post</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Posts Feed -->
          <div v-if="postsStore.isLoading && !creatingPost" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2 text-muted">Loading posts...</div>
          </div>
          
          <div v-else-if="postsStore.allPosts.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-chat-square-text fs-1 mb-3 d-block"></i>
            <h5>No posts yet</h5>
            <p>Be the first to share something!</p>
          </div>

          <div v-for="post in postsStore.allPosts" :key="post.id" class="card mb-4">
            <div class="card-body">
              <div class="d-flex align-items-start">
                <img :src="getAuthorAvatar(post)" alt="Profile" class="rounded-circle me-3" width="40" height="40">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                      <span class="fw-semibold me-2">{{ post.author?.name || post.user?.name || 'Anonymous' }}</span>
                      <span class="text-muted small">{{ formatTimeAgo(post.created_at) }}</span>
                    </div>
                    <div v-if="canDeletePost(post)" class="dropdown">
                      <button class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><button class="dropdown-item" @click="startEditPost(post)">
                          <i class="bi bi-pencil me-2"></i>Edit
                        </button></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item text-danger" @click="deletePost(post.id)">
                          <i class="bi bi-trash me-2"></i>Delete
                        </button></li>
                      </ul>
                    </div>
                  </div>
                  
                  <!-- Edit Form -->
                                    <!-- Edit Form -->
                  <div v-if="editingPost === post.id" class="mb-3">
                    <div class="mb-3">
                      <input 
                        type="text" 
                        class="form-control" 
                        :class="{ 'is-invalid': editFormErrors.title }"
                        placeholder="Post title"
                        v-model="editPost.title"
                        maxlength="255"
                      />
                      <div v-if="editFormErrors.title" class="error-message mt-2">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        {{ editFormErrors.title }}
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <textarea 
                        class="form-control" 
                        :class="{ 'is-invalid': editFormErrors.content }"
                        rows="3" 
                        placeholder="What's on your mind?"
                        v-model="editPost.content"
                        maxlength="500"
                        style="resize: none;"
                      ></textarea>
                      <div v-if="editFormErrors.content" class="error-message mt-2">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        {{ editFormErrors.content }}
                      </div>
                    </div>
                    
                    <!-- Current media display -->
                    <div v-if="(editPost.existingImage || editPost.existingMediaUrl) && !editPost.mediaFile" class="mb-2">
                      <img v-if="!editPost.existingMediaType || editPost.existingMediaType === 'image'"
                           :src="editPost.existingMediaUrl || editPost.existingImage" 
                           alt="Current image" 
                           class="img-fluid rounded" 
                           style="max-height: 200px;">
                      <video v-else-if="editPost.existingMediaType === 'video'"
                             :src="editPost.existingMediaUrl"
                             class="img-fluid rounded"
                             style="max-height: 200px; width: 100%; object-fit: cover;"
                             controls>
                        Your browser does not support the video tag.
                      </video>
                      <button @click="removeExistingMedia" 
                              class="btn btn-sm btn-outline-danger mt-1">
                        Remove {{ editPost.existingMediaType || 'Media' }}
                      </button>
                    </div>
                    
                    <!-- Media Upload for editing -->
                    <MediaUpload 
                      @media-uploaded="(file) => editPost.mediaFile = file"
                      @media-removed="() => editPost.mediaFile = null"
                      maxPreviewHeight="200px" />
                    
                    <div class="d-flex justify-content-end gap-2 mt-2">
                      <button @click="cancelEdit" class="btn btn-sm btn-outline-secondary">Cancel</button>
                      <button @click="saveEdit" class="btn btn-sm btn-primary">Save Changes</button>
                    </div>
                  </div>
                  
                  <!-- Normal Post Display -->
                  <div v-else>
                    <h6 v-if="post.title" class="mb-2 fw-semibold">{{ post.title }}</h6>
                    <p class="mb-3">{{ post.content }}</p>
                    
                    <div v-if="post.image || post.media_url" class="mb-3">
                      <img v-if="!post.media_type || post.media_type === 'image'" 
                           :src="post.media_url || post.image" 
                           alt="Post media" 
                           class="img-fluid rounded" 
                           style="max-height: 400px; width: 100%; object-fit: cover;">
                      <video v-else-if="post.media_type === 'video'" 
                             :src="post.media_url" 
                             class="img-fluid rounded" 
                             style="max-height: 400px; width: 100%; object-fit: cover;"
                             controls
                             preload="metadata">
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                  
                  <div class="d-flex align-items-center justify-content-between text-muted">
                    <button 
                      class="btn btn-link text-muted p-1 d-flex align-items-center like-btn"
                      :class="{ 'liked': post.user_has_reacted || post.user_reaction?.type === 'like' }"
                      @click="toggleLike(post)">
                      <i class="bi me-1" :class="(post.user_has_reacted || post.user_reaction?.type === 'like') ? 'bi-heart-fill' : 'bi-heart'"></i>
                      <span>{{ post.reaction_count || post.reactions_count || 0 }}</span>
                    </button>
                    <button 
                      class="btn btn-link text-muted p-1 d-flex align-items-center"
                      @click="toggleComments(post)">
                      <i class="bi bi-chat me-1"></i>
                      <span>{{ post.comment_count || post.comments_count || 0 }}</span>
                    </button>
                    <button class="btn btn-link text-muted p-1">
                      <i class="bi bi-share"></i>
                    </button>
                  </div>
                </div>
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
                          
                          <!-- Load More Comments -->
                          <div v-if="post.commentsPagination?.has_more_pages" class="text-center mt-3">
                            <button 
                              class="btn btn-sm btn-outline-secondary"
                              @click="loadMoreComments(post)"
                              :disabled="post.loadingMoreComments"
                            >
                              <span v-if="post.loadingMoreComments">
                                <div class="spinner-border spinner-border-sm me-1" role="status"></div>
                                Loading...
                              </span>
                              <span v-else>
                                <i class="bi bi-plus-circle me-1"></i>
                                Load more comments
                              </span>
                            </button>
                          </div>
                        </div>                <!-- Add Comment Input -->
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
          </div>
          
          <!-- Posts Pagination -->
          <PaginationComponent
            v-if="postsStore.allPosts.length > 0"
            :current-page="postsStore.currentPage"
            :total-pages="postsStore.pagination.totalPages"
            :total="postsStore.pagination.total"
            :per-page="postsStore.pagination.perPage"
            :has-more-pages="postsStore.hasMorePosts"
            :loading="postsStore.isLoading"
            mode="loadMore"
            item-type="posts"
            @load-more="loadMorePosts"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import { useMediaStore } from '../stores/media'
import { useRouter } from 'vue-router'
import MediaUpload from '../components/MediaUpload.vue'
import PaginationComponent from '../components/PaginationComponent.vue'
import ApiService from '../services/api.js'

export default {
  name: 'HomePage',
  components: {
    MediaUpload,
    PaginationComponent
  },
  setup() {
    const authStore = useAuthStore()
    const postsStore = usePostsStore()
    const mediaStore = useMediaStore()
    const router = useRouter()
    const creatingPost = ref(false)
    const editingPost = ref(null)
    const mediaUploadRef = ref(null)

    const newPost = reactive({
      title: '',
      content: '',
      mediaFile: null
    })

    const editPost = reactive({
      id: null,
      title: '',
      content: '',
      mediaFile: null,
      existingImage: null,
      existingMediaUrl: null,
      existingMediaType: null,
      mediaRemoved: false
    })

    const formErrors = reactive({
      title: '',
      content: ''
    })

    const editFormErrors = reactive({
      title: '',
      content: ''
    })

    const canPost = computed(() => {
      // Always allow submit button to be clickable for validation
      // Don't disable based on content - let validation handle it
      return true
    })

    const userAvatar = computed(() => {
      return authStore.user?.profile_picture || 
             authStore.user?.profilePicture || 
             'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    })

    const getAuthorAvatar = (item) => {
      // Handle both posts (with author field) and comments (with user field)
      const user = item.author || item.user
      console.log("user", item);
      return user?.profile_picture || 
             user?.profilePicture || 
             'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
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

    const canDeletePost = (post) => {
      const postAuthor = post.author || post.user
      return authStore.user && postAuthor && authStore.user.id === postAuthor.id
    }

    const validateCreateForm = () => {
      formErrors.title = ''
      formErrors.content = ''
      let isValid = true

      // Check if title is empty (required field)
      if (!newPost.title.trim()) {
        formErrors.title = 'Title is required.'
        isValid = false
      }

      // Check if content is empty (required field)
      if (!newPost.content.trim()) {
        formErrors.content = 'Content is required.'
        isValid = false
      }

      // Check title length
      if (newPost.title.length > 255) {
        formErrors.title = 'Title must be 255 characters or less.'
        isValid = false
      }

      // Check content length
      if (newPost.content.length > 500) {
        formErrors.content = 'Content must be 500 characters or less.'
        isValid = false
      }

      return isValid
    }

    const validateEditForm = () => {
      editFormErrors.title = ''
      editFormErrors.content = ''
      let isValid = true

      // Check if title is empty (required field)
      if (!editPost.title.trim()) {
        editFormErrors.title = 'Title is required.'
        isValid = false
      }

      // Check if content is empty (required field)
      if (!editPost.content.trim()) {
        editFormErrors.content = 'Content is required.'
        isValid = false
      }

      // Check title length
      if (editPost.title.length > 255) {
        editFormErrors.title = 'Title must be 255 characters or less.'
        isValid = false
      }

      // Check content length
      if (editPost.content.length > 500) {
        editFormErrors.content = 'Content must be 500 characters or less.'
        isValid = false
      }

      return isValid
    }

    const createPost = async () => {
      if (!validateCreateForm()) return

      creatingPost.value = true
      postsStore.clearError()

      try {
        const postData = {
          title: newPost.title.trim(),
          content: newPost.content.trim()
        }

        // Add the actual file object for upload
        if (newPost.mediaFile && newPost.mediaFile.file) {
          postData.image = newPost.mediaFile.file
        }

        await postsStore.createPost(postData)
        
        // Reset the entire form
        resetCreatePostForm()
      } catch (error) {
        console.error('Failed to create post:', error)
        // Handle server validation errors
        if (error.response && error.response.data && error.response.data.errors) {
          const serverErrors = error.response.data.errors
          if (serverErrors.title) formErrors.title = serverErrors.title[0]
          if (serverErrors.content) formErrors.content = serverErrors.content[0]
        }
      } finally {
        creatingPost.value = false
      }
    }

    const deletePost = async (postId) => {
      if (!confirm('Are you sure you want to delete this post?')) return

      try {
        await postsStore.deletePost(postId)
      } catch (error) {
        console.error('Failed to delete post:', error)
      }
    }

    const startEditPost = (post) => {
      editingPost.value = post.id
      editPost.id = post.id
      editPost.title = post.title
      editPost.content = post.content
      editPost.existingImage = post.image
      editPost.existingMediaUrl = post.media_url || post.image
      editPost.existingMediaType = post.media_type
      editPost.mediaFile = null
      editPost.mediaRemoved = false
      
      // Clear the create form's media upload component
      if (mediaUploadRef.value) {
        mediaUploadRef.value.clearMedia()
      }
    }

    const cancelEdit = () => {
      editingPost.value = null
      editPost.id = null
      editPost.title = ''
      editPost.content = ''
      editPost.existingImage = null
      editPost.existingMediaUrl = null
      editPost.existingMediaType = null
      editPost.mediaFile = null
      editPost.mediaRemoved = false
      
      // Clear validation errors
      editFormErrors.title = ''
      editFormErrors.content = ''
    }

    const removeExistingMedia = () => {
      editPost.existingImage = null
      editPost.existingMediaUrl = null
      editPost.existingMediaType = null
      editPost.mediaRemoved = true
    }

    const saveEdit = async () => {
      if (!validateEditForm()) return

      try {
        const postData = {
          title: editPost.title.trim(),
          content: editPost.content.trim()
        }

        // Add the actual file object for upload
        if (editPost.mediaFile && editPost.mediaFile.file) {
          postData.image = editPost.mediaFile.file
        } else if (editPost.mediaRemoved) {
          // If user explicitly removed media, set to null
          postData.image = null
        }

        await postsStore.updatePost(editPost.id, postData)
        cancelEdit()
      } catch (error) {
        console.error('Failed to update post:', error)
        // Handle server validation errors
        if (error.response && error.response.data && error.response.data.errors) {
          const serverErrors = error.response.data.errors
          if (serverErrors.title) editFormErrors.title = serverErrors.title[0]
          if (serverErrors.content) editFormErrors.content = serverErrors.content[0]
        }
      }
    }

    const refreshPosts = () => {
      postsStore.fetchPosts()
    }

    const toggleLike = async (post) => {
      try {
        await postsStore.toggleReaction(post.id, 'like')
      } catch (error) {
        console.error('Failed to toggle like:', error)
      }
    }

    const toggleComments = async (post) => {
      if (!post.showComments) {
        // Show comments and load them if not already loaded
        post.showComments = true
        if (!post.commentsLoaded) {
          try {
            const response = await ApiService.getPostComments(post.id, 1, 10)
            if (response.success) {
              post.commentsList = response.data
              post.commentsLoaded = true
              post.commentsPagination = response.pagination || {
                current_page: 1,
                total_pages: 1,
                has_more_pages: false
              }
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

    const loadMoreComments = async (post) => {
      if (!post.commentsPagination?.has_more_pages || post.loadingMoreComments) return

      post.loadingMoreComments = true
      
      try {
        const nextPage = post.commentsPagination.current_page + 1
        const response = await ApiService.getPostComments(post.id, nextPage, 10)
        
        if (response.success) {
          // Append new comments
          post.commentsList = [...post.commentsList, ...response.data]
          post.commentsPagination = response.pagination
        }
      } catch (error) {
        console.error('Error loading more comments:', error)
      } finally {
        post.loadingMoreComments = false
      }
    }

    const loadMorePosts = async () => {
      await postsStore.loadMorePosts()
    }

    const onMediaUploaded = (uploadedFile) => {
      newPost.mediaFile = uploadedFile
    }

    const onMediaRemoved = () => {
      newPost.mediaFile = null
    }

    const resetCreatePostForm = () => {
      // Reset form data
      newPost.title = ''
      newPost.content = ''
      newPost.mediaFile = null
      
      // Clear validation errors
      formErrors.title = ''
      formErrors.content = ''
      
      // Clear the media upload component
      if (mediaUploadRef.value) {
        mediaUploadRef.value.clearMedia()
      }
      
      // Clear all uploaded files from media store
      mediaStore.clearAllFiles()
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
          post.comment_count = (post.comment_count || 0) + 1
          
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

    const logout = async () => {
      await authStore.logout()
      postsStore.clearPosts()
      await router.replace('/')
    }

    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        router.push('/')
        return
      }

      // Fetch posts when component mounts
      await postsStore.fetchPosts()
    })

    // Watch for real-time validation feedback
    watch(() => newPost.title, (newTitle) => {
      if (newTitle.length > 255) {
        formErrors.title = 'Title must be 255 characters or less.'
      } else if (newTitle.trim()) {
        // Clear all title errors when user has typed valid content
        formErrors.title = ''
      }
    })

    watch(() => newPost.content, (newContent) => {
      if (newContent.length > 500) {
        formErrors.content = 'Content must be 500 characters or less.'
      } else if (newContent.trim()) {
        // Clear all content errors when user has typed valid content
        formErrors.content = ''
      }
    })

    // Watch for posts changes and initialize newComment property
    watch(() => postsStore.allPosts, (newPosts) => {
      newPosts.forEach(post => {
        if (!post.hasOwnProperty('newComment')) {
          post.newComment = ''
        }
      })
    }, { immediate: true, deep: true })

    return {
      authStore,
      postsStore,
      mediaStore,
      newPost,
      editPost,
      editingPost,
      formErrors,
      editFormErrors,
      userAvatar,
      canPost,
      creatingPost,
      validateCreateForm,
      validateEditForm,
      createPost,
      deletePost,
      startEditPost,
      cancelEdit,
      removeExistingMedia,
      saveEdit,
      refreshPosts,
      toggleLike,
      toggleComments,
      loadMoreComments,
      loadMorePosts,
      onMediaUploaded,
      onMediaRemoved,
      resetCreatePostForm,
      addComment,
      logout,
      getAuthorAvatar,
      formatTimeAgo,
      canDeletePost,
      mediaUploadRef
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
  
  .card {
    margin-bottom: 1rem;
    border-radius: 12px;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .form-control {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .comment-input-field {
    font-size: 16px; /* Prevents zoom on iOS */
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
  
  .navbar .navbar-brand span {
    font-size: 1.1rem;
  }
  
  .card-body {
    padding: 0.875rem;
  }
  
  .comment-bubble {
    padding: 10px 12px;
  }
  
  .comment-author {
    font-size: 13px;
  }
  
  .comment-text {
    font-size: 13px;
  }
  
  .avatar-circle {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
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
  
  .card {
    border-radius: 15px;
  }
  
  .card-body {
    padding: 1.25rem;
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
  
  /* Content adjustments */
  .col-lg-8 {
    max-width: 100%;
    padding: 0;
  }
  
  /* Post creation form */
  .card .form-control {
    border-radius: 8px;
    padding: 0.75rem;
  }
  
  textarea.form-control {
    min-height: 80px;
  }
  
  /* Post display */
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
  }
  
  .send-button {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }
  
  /* Error messages */
  .error-message {
    font-size: 13px;
    padding: 6px 10px;
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
  
  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .text-muted.small {
    text-align: center;
    order: 2;
  }
  
  .btn.btn-dark {
    width: 100%;
    order: 1;
  }
  
  /* Profile images */
  img[width="40"][height="40"] {
    width: 35px !important;
    height: 35px !important;
  }
  
  img[width="32"][height="32"] {
    width: 28px !important;
    height: 28px !important;
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
  
  .card {
    margin-bottom: 0.75rem;
  }
  
  .card-body {
    padding: 1rem;
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
  }
  
  .send-button {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Dark mode support for mobile */
@media (prefers-color-scheme: dark) and (max-width: 767.98px) {
  .card {
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
}

/* Accessibility improvements for mobile */
@media (max-width: 767.98px) {
  /* Ensure sufficient contrast */
  .text-muted {
    color: #666 !important;
  }
  
  /* Improve focus indicators */
  .form-control:focus,
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
}
</style>
