const API_BASE_URL = 'http://localhost:8000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 413) {
          const error = new Error('File too large. Please choose a smaller file (max 200MB for videos, 10MB for images).')
          error.response = { 
            status: response.status,
            data: { message: 'File too large' }
          }
          throw error
        }
        
        // Create error with response data for better error handling
        const error = new Error(data.message || 'Something went wrong')
        error.response = { 
          status: response.status,
          data: data 
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)
      
      // If it's a network error or parsing error, wrap it properly
      if (!error.response) {
        const wrappedError = new Error(error.message || 'Network error')
        wrappedError.response = null
        throw wrappedError
      }
      
      throw error
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    })
  }

  async getUser() {
    return this.request('/user')
  }

  async getProfile() {
    return this.request('/profile')
  }

  // Posts endpoints
  async getPosts(page = 1, perPage = 10) {
    return this.request(`/posts?page=${page}&per_page=${perPage}`)
  }

  async getMyPosts(page = 1, perPage = 10) {
    return this.request(`/my-posts?page=${page}&per_page=${perPage}`)
  }

  async createPost(postData) {
    console.log('Creating post with data:', postData);
    console.log('Image is File?', postData.image instanceof File);
    
    // Check if we have an image file to upload
    if (postData.image && postData.image instanceof File) {
      console.log('Sending as FormData');
      const formData = new FormData()
      formData.append('title', postData.title)
      formData.append('content', postData.content)
      formData.append('image', postData.image)

      const url = `${this.baseURL}/posts`
      const headers = {}
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: formData
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong')
        }

        return data
      } catch (error) {
        console.error('API Request failed:', error)
        throw error
      }
    } else {
      // No image, send as JSON
      console.log('Sending as JSON');
      return this.request('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      })
    }
  }

  async getPost(id) {
    return this.request(`/posts/${id}`)
  }

  async updatePost(id, postData) {
    console.log('Updating post with data:', postData);
    console.log('Image is File?', postData.image instanceof File);
    
    // Check if we have an image file to upload or need to handle media removal
    if ((postData.image && postData.image instanceof File) || postData.image === null) {
      console.log('Sending update as FormData');
      const formData = new FormData()
      formData.append('title', postData.title)
      formData.append('content', postData.content)
      
      // Handle file upload or explicit removal
      if (postData.image instanceof File) {
        formData.append('image', postData.image)
      } else if (postData.image === null) {
        // For explicit removal, add a flag instead of empty image
        formData.append('remove_media', '1')
      }
      
      formData.append('_method', 'PUT') // Laravel method spoofing for multipart

      const url = `${this.baseURL}/posts/${id}`
      const headers = {}
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      try {
        const response = await fetch(url, {
          method: 'POST', // Use POST with _method spoofing for file uploads
          headers: headers,
          body: formData
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong')
        }

        return data
      } catch (error) {
        console.error('API Request failed:', error)
        throw error
      }
    } else {
      // No image file, send as JSON
      console.log('Sending update as JSON');
      
      // Handle media removal in JSON mode
      if (postData.image === null) {
        postData.remove_media = '1'
        delete postData.image // Remove the null image property
      }
      
      return this.request(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      })
    }
  }

  async deletePost(id) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Post reactions
  async toggleReaction(postId, reactionType) {
    console.log('Toggling reaction:', { postId, reactionType });
    return this.request(`/posts/${postId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    })
  }

  // Comments endpoints
  async getPostComments(postId, page = 1, perPage = 10) {
    return this.request(`/posts/${postId}/comments?page=${page}&per_page=${perPage}`)
  }

  async createComment(postId, commentData) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    })
  }
}

export default new ApiService()
