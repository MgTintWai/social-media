<template>
  <div class="media-upload">
    <!-- Upload Controls -->
    <div class="upload-controls d-flex align-items-center">
      <input type="file" 
             ref="photoInput" 
             accept="image/*" 
             style="display: none;" 
             @change="handleFileUpload($event, 'image')">
      <button type="button" 
              class="btn btn-link text-muted p-1 me-2"
              @click="$refs.photoInput.click()"
              :disabled="disabled || hasMedia">
        <i class="bi bi-image"></i> Photo
      </button>
      
      <input type="file" 
             ref="videoInput" 
             accept="video/*" 
             style="display: none;" 
             @change="handleFileUpload($event, 'video')">
      <button type="button" 
              class="btn btn-link text-muted p-1"
              @click="$refs.videoInput.click()"
              :disabled="disabled || hasMedia">
        <i class="bi bi-camera-video"></i> Video
      </button>
    </div>

    <!-- Upload Progress -->
    <div v-if="mediaStore.isUploading" class="upload-progress mt-2">
      <div class="d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        <span class="small text-muted">Uploading...</span>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="mediaStore.error" class="alert alert-danger alert-sm mt-2">
      {{ mediaStore.error }}
      <button type="button" 
              class="btn-close btn-sm" 
              @click="mediaStore.clearError()"></button>
    </div>

    <!-- Media Preview -->
    <div v-if="uploadedMedia" class="media-preview mt-3">
      <div class="position-relative d-inline-block">
        <img v-if="uploadedMedia.mediaType === 'image'" 
             :src="uploadedMedia.url" 
             alt="Upload preview" 
             class="img-fluid rounded"
             :style="previewStyle">
        <video v-else-if="uploadedMedia.mediaType === 'video'" 
               :src="uploadedMedia.url" 
               class="img-fluid rounded"
               :style="previewStyle"
               controls>
        </video>
        
        <button type="button" 
                class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                @click="removeMedia">
          <i class="bi bi-x"></i>
        </button>
        
        <!-- File Info -->
        <div class="file-info position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2 rounded-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <span class="small">{{ uploadedMedia.name }}</span>
            <span class="small">{{ mediaStore.formatFileSize(uploadedMedia.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useMediaStore } from '../stores/media'

export default {
  name: 'MediaUpload',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    maxPreviewHeight: {
      type: String,
      default: '200px'
    },
    maxPreviewWidth: {
      type: String,
      default: '100%'
    }
  },
  emits: ['media-uploaded', 'media-removed'],
  setup(props, { emit }) {
    const mediaStore = useMediaStore()

    const uploadedMedia = computed(() => {
      return mediaStore.uploadedFiles[mediaStore.uploadedFiles.length - 1] || null
    })

    const hasMedia = computed(() => {
      return uploadedMedia.value !== null
    })

    const previewStyle = computed(() => {
      return {
        'max-height': props.maxPreviewHeight,
        'max-width': props.maxPreviewWidth,
        'object-fit': 'cover'
      }
    })

    const handleFileUpload = async (event, type) => {
      const file = event.target.files[0]
      if (!file) return

      try {
        const uploadedFile = await mediaStore.uploadFile(file, type)
        emit('media-uploaded', uploadedFile)
        
        // Clear the input value so the same file can be selected again
        event.target.value = ''
      } catch (error) {
        console.error('Upload failed:', error)
        // Error is already handled in the store
      }
    }

    const removeMedia = () => {
      if (uploadedMedia.value) {
        mediaStore.removeFile(uploadedMedia.value.id)
        emit('media-removed')
      }
    }

    return {
      mediaStore,
      uploadedMedia,
      hasMedia,
      previewStyle,
      handleFileUpload,
      removeMedia
    }
  }
}
</script>

<style scoped>
.upload-controls .btn-link {
  border: none;
  background: none;
  text-decoration: none;
}

.upload-controls .btn-link:hover:not(:disabled) {
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.upload-controls .btn-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.media-preview {
  max-width: 100%;
}

.file-info {
  font-size: 0.75rem;
}

.alert-sm {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.btn-close.btn-sm {
  font-size: 0.75rem;
  padding: 0.25rem;
}
</style>
