import { defineStore } from 'pinia'
import apiService from '../services/api'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      perPage: 10,
      total: 0,
      hasMorePages: false
    }
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    errorMessage: (state) => state.error,
    allPosts: (state) => state.posts,
    hasMorePosts: (state) => state.pagination.hasMorePages,
    currentPage: (state) => state.pagination.currentPage
  },

  actions: {
    async fetchPosts(page = 1, perPage = 10, append = false) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.getPosts(page, perPage)
        
        if (append && page > 1) {
          // Append new posts for infinite scroll/load more
          this.posts = [...this.posts, ...(response.data || [])]
        } else {
          // Replace posts for initial load or refresh
          this.posts = response.data || []
        }
        
        // Update pagination info
        if (response.meta) {
          this.pagination = {
            currentPage: response.meta.current_page,
            totalPages: response.meta.last_page,
            perPage: response.meta.per_page,
            total: response.meta.total,
            hasMorePages: response.meta.current_page < response.meta.last_page
          }
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch posts'
        console.error('Error fetching posts:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchMyPosts(page = 1, perPage = 10, append = false) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.getMyPosts(page, perPage)
        
        if (append && page > 1) {
          // Append new posts for infinite scroll/load more
          this.posts = [...this.posts, ...(response.data || [])]
        } else {
          // Replace posts for initial load or refresh
          this.posts = response.data || []
        }
        
        // Update pagination info
        if (response.meta) {
          this.pagination = {
            currentPage: response.meta.current_page,
            totalPages: response.meta.last_page,
            perPage: response.meta.per_page,
            total: response.meta.total,
            hasMorePages: response.meta.current_page < response.meta.last_page
          }
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch my posts'
        console.error('Error fetching my posts:', error)
      } finally {
        this.loading = false
      }
    },

    async loadMorePosts() {
      if (this.hasMorePosts && !this.loading) {
        await this.fetchPosts(this.currentPage + 1, this.pagination.perPage, true)
      }
    },

    async loadMoreMyPosts() {
      if (this.hasMorePosts && !this.loading) {
        await this.fetchMyPosts(this.currentPage + 1, this.pagination.perPage, true)
      }
    },

    async createPost(postData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.createPost(postData)
        
        // Add the new post to the beginning of the posts array
        if (response.data) {
          this.posts.unshift(response.data)
        }
        
        return response.data
      } catch (error) {
        this.error = error.message || 'Failed to create post'
        console.error('Error creating post:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePost(postId) {
      this.loading = true
      this.error = null
      
      try {
        await apiService.deletePost(postId)
        
        // Remove the post from the posts array
        this.posts = this.posts.filter(post => post.id !== postId)
      } catch (error) {
        this.error = error.message || 'Failed to delete post'
        console.error('Error deleting post:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePost(postId, postData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.updatePost(postId, postData)
        
        // Update the post in the posts array
        const index = this.posts.findIndex(post => post.id === postId)
        if (index !== -1) {
          this.posts[index] = response.data
        }
        
        return response.data
      } catch (error) {
        this.error = error.message || 'Failed to update post'
        console.error('Error updating post:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleReaction(postId, reactionType) {
      this.error = null
      
      try {
        const response = await apiService.toggleReaction(postId, reactionType)
        
        // Update the post in the posts array with new reaction data
        const index = this.posts.findIndex(post => post.id === postId)
        if (index !== -1) {
          const post = this.posts[index]
          
          // Update reaction counts and user reaction status
          post.reaction_count = response.data.reaction_count || response.data.total_reactions_count
          post.reactions_count = response.data.reaction_count || response.data.total_reactions_count
          post.reactions_by_type = response.data.reactions_by_type
          post.user_has_reacted = response.data.user_has_reacted
          
          if (response.data.user_has_reacted) {
            post.user_reaction = {
              type: response.data.user_reaction_type || reactionType,
              reacted_at: new Date().toISOString()
            }
          } else {
            post.user_reaction = null
          }
        }
        
        return response.data
      } catch (error) {
        this.error = error.message || 'Failed to toggle reaction'
        console.error('Error toggling reaction:', error)
        throw error
      }
    },

    clearError() {
      this.error = null
    },

    clearPosts() {
      this.posts = []
    }
  }
})
