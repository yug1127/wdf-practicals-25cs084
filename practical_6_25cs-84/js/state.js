/**
 * Modular JS: State Management & Data Processing Module
 * Handles search, multi-criteria filtering, multi-field sorting, and pagination calculations.
 * Practical 6 - Yug Patel (25CS084)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PortalState = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Default sorting configuration per dataset
  const DEFAULT_SORTS = {
    events: { field: 'date', order: 'asc' },
    students: { field: 'cgpa', order: 'desc' },
    faqs: { field: 'helpfulCount', order: 'desc' }
  };

  /**
   * Internal State Model
   */
  const state = {
    dataset: 'events',
    searchQuery: '',
    filterCategory: 'all',
    filterSecondary: 'all',
    sortBy: DEFAULT_SORTS.events.field,
    sortOrder: DEFAULT_SORTS.events.order,
    currentPage: 1,
    pageSize: 6,
    rawData: [],
    isLoading: false,
    error: null,
    listeners: new Set()
  };

  /**
   * Subscribe to state change notifications
   * @param {Function} listener 
   * @returns {Function} unsubscribe function
   */
  function subscribe(listener) {
    state.listeners.add(listener);
    return () => state.listeners.delete(listener);
  }

  /**
   * Notify all subscribed listeners
   */
  function notify() {
    state.listeners.forEach(fn => {
      try {
        fn(getState(), getProcessedResults());
      } catch (e) {
        console.error('State notification error:', e);
      }
    });
  }

  /**
   * Returns a snapshot of current state
   */
  function getState() {
    return { ...state };
  }

  /**
   * Switch active dataset ('events' | 'students' | 'faqs')
   */
  function setDataset(datasetKey) {
    if (state.dataset === datasetKey) return;
    state.dataset = datasetKey;
    state.searchQuery = '';
    state.filterCategory = 'all';
    state.filterSecondary = 'all';
    state.currentPage = 1;
    const def = DEFAULT_SORTS[datasetKey] || { field: 'id', order: 'asc' };
    state.sortBy = def.field;
    state.sortOrder = def.order;
    state.error = null;
    notify();
  }

  /**
   * Set raw data loaded from API
   */
  function setRawData(data) {
    state.rawData = Array.isArray(data) ? data : [];
    state.isLoading = false;
    state.error = null;
    state.currentPage = 1;
    notify();
  }

  /**
   * Set loading status
   */
  function setLoading(loading) {
    state.isLoading = !!loading;
    if (loading) state.error = null;
    notify();
  }

  /**
   * Set error status
   */
  function setError(errorMsg) {
    state.error = errorMsg;
    state.isLoading = false;
    notify();
  }

  /**
   * Set search query
   */
  function setSearchQuery(query) {
    state.searchQuery = (query || '').trim();
    state.currentPage = 1;
    notify();
  }

  /**
   * Set primary filter (Category / Branch)
   */
  function setFilterCategory(category) {
    state.filterCategory = category || 'all';
    state.currentPage = 1;
    notify();
  }

  /**
   * Set secondary filter (Status / Semester)
   */
  function setFilterSecondary(status) {
    state.filterSecondary = status || 'all';
    state.currentPage = 1;
    notify();
  }

  /**
   * Set sorting field
   */
  function setSortBy(field) {
    state.sortBy = field;
    state.currentPage = 1;
    notify();
  }

  /**
   * Toggle or set sort direction ('asc' | 'desc')
   */
  function setSortOrder(order) {
    if (order) {
      state.sortOrder = order;
    } else {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    state.currentPage = 1;
    notify();
  }

  /**
   * Set current page number
   */
  function setPage(page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum >= 1) {
      state.currentPage = pageNum;
      notify();
    }
  }

  /**
   * Set page size (e.g. 5, 10, 15)
   */
  function setPageSize(size) {
    const s = parseInt(size, 10);
    if (!isNaN(s) && s > 0) {
      state.pageSize = s;
      state.currentPage = 1;
      notify();
    }
  }

  /**
   * Reset all search and filter parameters
   */
  function resetFilters() {
    state.searchQuery = '';
    state.filterCategory = 'all';
    state.filterSecondary = 'all';
    state.currentPage = 1;
    const def = DEFAULT_SORTS[state.dataset] || { field: 'id', order: 'asc' };
    state.sortBy = def.field;
    state.sortOrder = def.order;
    notify();
  }

  /**
   * Filters and sorts the active dataset, then produces pagination metadata
   */
  function getProcessedResults() {
    const { dataset, rawData, searchQuery, filterCategory, filterSecondary, sortBy, sortOrder, currentPage, pageSize } = state;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {
        items: [],
        totalItems: 0,
        filteredCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize,
        startIndex: 0,
        endIndex: 0
      };
    }

    const q = searchQuery.toLowerCase();

    // 1. Filter phase
    const filtered = rawData.filter(item => {
      // Primary filter (Category / Branch)
      if (filterCategory !== 'all') {
        if (dataset === 'students') {
          if (item.branch !== filterCategory) return false;
        } else {
          if (item.category !== filterCategory) return false;
        }
      }

      // Secondary filter (Status)
      if (filterSecondary !== 'all') {
        if (item.status && item.status !== filterSecondary) return false;
      }

      // Search Query filter across relevant fields
      if (q) {
        if (dataset === 'events') {
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchCategory = (item.category || '').toLowerCase().includes(q);
          const matchVenue = (item.venue || '').toLowerCase().includes(q);
          const matchOrganizer = (item.organizer || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          const matchTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchCategory && !matchVenue && !matchOrganizer && !matchDesc && !matchTags) {
            return false;
          }
        } else if (dataset === 'students') {
          const matchName = (item.name || '').toLowerCase().includes(q);
          const matchRoll = (item.rollNumber || '').toLowerCase().includes(q);
          const matchEmail = (item.email || '').toLowerCase().includes(q);
          const matchBranch = (item.branch || '').toLowerCase().includes(q);
          const matchCity = (item.city || '').toLowerCase().includes(q);
          const matchSkills = Array.isArray(item.skills) && item.skills.some(s => s.toLowerCase().includes(q));
          if (!matchName && !matchRoll && !matchEmail && !matchBranch && !matchCity && !matchSkills) {
            return false;
          }
        } else if (dataset === 'faqs') {
          const matchQuestion = (item.question || '').toLowerCase().includes(q);
          const matchAnswer = (item.answer || '').toLowerCase().includes(q);
          const matchCategory = (item.category || '').toLowerCase().includes(q);
          const matchTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
          if (!matchQuestion && !matchAnswer && !matchCategory && !matchTags) {
            return false;
          }
        }
      }

      return true;
    });

    // 2. Sorting phase
    const sorted = [...filtered].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle undefined / null
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      // Date comparison
      if (sortBy === 'date' || sortBy === 'lastUpdated') {
        const timeA = new Date(valA).getTime() || 0;
        const timeB = new Date(valB).getTime() || 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // Numeric comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      // String comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const cmp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    // 3. Pagination phase
    const totalItems = rawData.length;
    const filteredCount = sorted.length;
    const totalPages = Math.ceil(filteredCount / pageSize) || 1;
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredCount);
    const paginatedItems = sorted.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalItems,
      filteredCount,
      totalPages,
      currentPage: safeCurrentPage,
      pageSize,
      startIndex: filteredCount > 0 ? startIndex + 1 : 0,
      endIndex
    };
  }

  /**
   * Extract distinct categories/branches and statuses for the current dataset
   */
  function getFilterOptions() {
    const { dataset, rawData } = state;
    if (!Array.isArray(rawData)) return { primary: [], secondary: [] };

    const primaryKey = dataset === 'students' ? 'branch' : 'category';
    const primarySet = new Set();
    const secondarySet = new Set();

    rawData.forEach(item => {
      if (item[primaryKey]) primarySet.add(item[primaryKey]);
      if (item.status) secondarySet.add(item.status);
    });

    return {
      primary: Array.from(primarySet).sort(),
      secondary: Array.from(secondarySet).sort()
    };
  }

  return {
    subscribe,
    getState,
    setDataset,
    setRawData,
    setLoading,
    setError,
    setSearchQuery,
    setFilterCategory,
    setFilterSecondary,
    setSortBy,
    setSortOrder,
    setPage,
    setPageSize,
    resetFilters,
    getProcessedResults,
    getFilterOptions
  };
});
