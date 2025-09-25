import { defineStore } from 'pinia'

export const useMediaStore = defineStore('media', {
  state: () => ({
    uploadedFiles: [],
    isUploading: false,
    error: null
  }),

  getters: {
    getFileById: (state) => (id) => {
      return state.uploadedFiles.find(file => file.id === id)
    }
  },

  actions: {
    async uploadFile(file, type = 'image') {
      this.isUploading = true
      this.error = null

      try {
        // Validate file type
        if (type === 'image' && !file.type.startsWith('image/')) {
          throw new Error('Please select a valid image file')
        }
        
        if (type === 'video' && !file.type.startsWith('video/')) {
          throw new Error('Please select a valid video file')
        }

        // Validate file size
        const maxSize = type === 'video' ? 200 * 1024 * 1024 : 10 * 1024 * 1024 // 200MB for video, 10MB for images
        if (file.size > maxSize) {
          const sizeLimit = type === 'video' ? '200MB' : '10MB'
          throw new Error(`File is too large. Maximum size is ${sizeLimit}. Your file is ${this.formatFileSize(file.size)}.`)
        }

        // Create file preview
        const fileUrl = await this.createFilePreview(file)
        
        const uploadedFile = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          mediaType: type,
          url: fileUrl,
          file: file,
          uploadedAt: new Date()
        }

        this.uploadedFiles.push(uploadedFile)
        return uploadedFile

      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isUploading = false
      }
    },

    createFilePreview(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    },

    removeFile(fileId) {
      const index = this.uploadedFiles.findIndex(file => file.id === fileId)
      if (index > -1) {
        this.uploadedFiles.splice(index, 1)
      }
    },

    clearError() {
      this.error = null
    },

    clearAllFiles() {
      this.uploadedFiles = []
      this.error = null
    },

    // Utility function to format file size
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // Utility function to get file extension
    getFileExtension(filename) {
      return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)
    }
  }
})
