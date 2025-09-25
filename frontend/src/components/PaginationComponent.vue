<template>
  <div class="pagination-container">
    <!-- Load More Button -->
    <div v-if="showLoadMore" class="text-center mb-4">
      <button 
        class="btn btn-outline-primary btn-load-more"
        @click="$emit('loadMore')"
        :disabled="loading"
      >
        <span v-if="loading" class="d-flex align-items-center justify-content-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading...
        </span>
        <span v-else class="d-flex align-items-center justify-content-center">
          <i class="bi bi-plus-circle me-2"></i>
          Load More {{ itemType }}
        </span>
      </button>
    </div>

    <!-- Page Numbers Navigation -->
    <nav v-if="showPageNumbers && totalPages > 1" aria-label="Pagination">
      <ul class="pagination justify-content-center">
        <!-- Previous Button -->
        <li class="page-item" :class="{ disabled: currentPage <= 1 }">
          <button 
            class="page-link" 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>

        <!-- First Page -->
        <li v-if="showFirstPage" class="page-item">
          <button class="page-link" @click="goToPage(1)">1</button>
        </li>

        <!-- First Ellipsis -->
        <li v-if="showFirstEllipsis" class="page-item disabled">
          <span class="page-link">...</span>
        </li>

        <!-- Page Numbers -->
        <li 
          v-for="page in visiblePages" 
          :key="page" 
          class="page-item" 
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>

        <!-- Last Ellipsis -->
        <li v-if="showLastEllipsis" class="page-item disabled">
          <span class="page-link">...</span>
        </li>

        <!-- Last Page -->
        <li v-if="showLastPage" class="page-item">
          <button class="page-link" @click="goToPage(totalPages)">{{ totalPages }}</button>
        </li>

        <!-- Next Button -->
        <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
          <button 
            class="page-link" 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>

      <!-- Pagination Info -->
      <div class="pagination-info text-center text-muted small mt-2">
        Showing {{ startItem }}-{{ endItem }} of {{ total }} {{ itemType }}
      </div>
    </nav>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PaginationComponent',
  props: {
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    perPage: {
      type: Number,
      default: 10
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasMorePages: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'loadMore', // 'loadMore' or 'pages'
      validator: (value) => ['loadMore', 'pages'].includes(value)
    },
    itemType: {
      type: String,
      default: 'items'
    }
  },
  emits: ['loadMore', 'pageChange'],
  setup(props, { emit }) {
    const showLoadMore = computed(() => {
      return props.mode === 'loadMore' && props.hasMorePages
    })

    const showPageNumbers = computed(() => {
      return props.mode === 'pages'
    })

    const visiblePages = computed(() => {
      const delta = 2 // Number of pages to show on each side of current page
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, props.currentPage - delta);
           i <= Math.min(props.totalPages - 1, props.currentPage + delta);
           i++) {
        range.push(i)
      }

      if (props.currentPage - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (props.currentPage + delta < props.totalPages - 1) {
        rangeWithDots.push('...', props.totalPages)
      } else {
        rangeWithDots.push(props.totalPages)
      }

      // Remove duplicates and invalid pages
      return [...new Set(rangeWithDots)].filter(page => 
        typeof page === 'number' && page >= 1 && page <= props.totalPages
      )
    })

    const showFirstPage = computed(() => {
      return props.totalPages > 1 && !visiblePages.value.includes(1)
    })

    const showLastPage = computed(() => {
      return props.totalPages > 1 && !visiblePages.value.includes(props.totalPages)
    })

    const showFirstEllipsis = computed(() => {
      return props.currentPage - 2 > 2
    })

    const showLastEllipsis = computed(() => {
      return props.currentPage + 2 < props.totalPages - 1
    })

    const startItem = computed(() => {
      return (props.currentPage - 1) * props.perPage + 1
    })

    const endItem = computed(() => {
      return Math.min(props.currentPage * props.perPage, props.total)
    })

    const goToPage = (page) => {
      if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('pageChange', page)
      }
    }

    return {
      showLoadMore,
      showPageNumbers,
      visiblePages,
      showFirstPage,
      showLastPage,
      showFirstEllipsis,
      showLastEllipsis,
      startItem,
      endItem,
      goToPage
    }
  }
}
</script>

<style scoped>
.pagination-container {
  margin: 20px 0;
}

.btn-load-more {
  border: 2px solid #007bff;
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.btn-load-more:hover:not(:disabled) {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-load-more:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 8px 12px;
  margin: 0 2px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.pagination .page-link:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
  transform: translateY(-1px);
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-color: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.pagination .page-item.disabled .page-link {
  color: #adb5bd;
  background-color: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Responsive design */

/* iPhone XR (414x896) */
@media only screen and (max-width: 414px) and (max-height: 896px) {
  .btn-load-more {
    padding: 10px 20px;
    font-size: 0.9rem;
    border-radius: 20px;
  }
  
  .pagination .page-link {
    padding: 6px 10px;
    font-size: 0.85rem;
    margin: 0 1px;
  }
  
  .pagination-info {
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
}

/* iPhone 12 PRO (390x844) */
@media only screen and (max-width: 390px) and (max-height: 844px) {
  .btn-load-more {
    padding: 10px 18px;
    font-size: 0.875rem;
  }
  
  .pagination .page-link {
    padding: 5px 8px;
    font-size: 0.8rem;
  }
}

/* iPhone 14 PRO Max (430x932) */
@media only screen and (max-width: 430px) and (max-height: 932px) {
  .btn-load-more {
    padding: 12px 24px;
    font-size: 0.95rem;
  }
}

/* General mobile styles */
@media (max-width: 767.98px) {
  .pagination-container {
    margin: 15px 0;
    padding: 0 10px;
  }
  
  .btn-load-more {
    width: 100%;
    max-width: none;
    min-height: 44px; /* iOS touch target */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .pagination {
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .pagination .page-item {
    margin: 2px;
  }
  
  .pagination .page-link {
    padding: 8px 12px;
    font-size: 0.875rem;
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .pagination-info {
    font-size: 0.875rem;
    padding: 0 10px;
    text-align: center;
  }
}

@media (max-width: 575.98px) {
  .pagination {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .pagination .page-link {
    padding: 6px 8px;
    font-size: 0.8rem;
    min-width: 36px;
    min-height: 36px;
  }
  
  .btn-load-more {
    width: 100%;
    max-width: none;
    font-size: 0.875rem;
    padding: 12px 16px;
  }
  
  /* Hide some page numbers on very small screens */
  .pagination .page-item:not(.active):not(:first-child):not(:last-child):not(:nth-child(2)):not(:nth-last-child(2)) {
    display: none;
  }
}

/* Touch device improvements */
@media (hover: none) and (pointer: coarse) {
  .btn-load-more {
    min-height: 48px;
    font-weight: 500;
  }
  
  .pagination .page-link {
    min-height: 44px;
    min-width: 44px;
  }
  
  .pagination .page-link:hover {
    transform: none; /* Disable hover transforms on touch */
  }
}

/* Landscape orientation */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .pagination-container {
    margin: 10px 0;
  }
  
  .btn-load-more {
    padding: 8px 16px;
  }
  
  .pagination .page-link {
    padding: 6px 10px;
  }
}
</style>
