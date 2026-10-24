/**
 * Modular JS: Main Application Controller
 * Coordinates API calls, state subscriptions, DOM events, search debouncing, and UI updates.
 * Practical 6 - Yug Patel (25CS084)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PortalApp = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Sort dropdown configurations customized per dataset
  const SORT_OPTIONS = {
    events: [
      { value: 'date', label: '📅 Event Date' },
      { value: 'title', label: '🔤 Title (A–Z)' },
      { value: 'capacity', label: '👥 Total Capacity' },
      { value: 'registered', label: '📈 Registered Seats' },
      { value: 'rating', label: '⭐ Rating' },
      { value: 'fee', label: '💰 Registration Fee' }
    ],
    students: [
      { value: 'cgpa', label: '⭐ CGPA (Grade)' },
      { value: 'name', label: '🔤 Student Name' },
      { value: 'rollNumber', label: '🆔 Roll Number' },
      { value: 'semester', label: '🎓 Semester' },
      { value: 'city', label: '📍 City' }
    ],
    faqs: [
      { value: 'helpfulCount', label: '👍 Most Helpful Votes' },
      { value: 'views', label: '👁️ Most Viewed' },
      { value: 'question', label: '🔤 Question (A–Z)' },
      { value: 'lastUpdated', label: '🕒 Last Updated' }
    ]
  };

  /**
   * DOM Elements Cache
   */
  let dom = {};

  /**
   * Search debounce timer
   */
  let searchTimer = null;

  /**
   * Initialize DOM references
   */
  function cacheDom() {
    dom = {
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      themeIcon: document.getElementById('themeIcon'),
      datasetTabs: document.querySelectorAll('.dataset-tab'),
      searchInput: document.getElementById('searchInput'),
      searchClearBtn: document.getElementById('searchClearBtn'),
      filterCategory: document.getElementById('filterCategory'),
      filterSecondary: document.getElementById('filterSecondary'),
      sortBy: document.getElementById('sortBy'),
      sortOrderBtn: document.getElementById('sortOrderBtn'),
      sortOrderIcon: document.getElementById('sortOrderIcon'),
      pageSize: document.getElementById('pageSize'),
      btnResetFilters: document.getElementById('btnResetFilters'),
      btnSimulateError: document.getElementById('btnSimulateError'),
      btnSimulateLatency: document.getElementById('btnSimulateLatency'),
      contentContainer: document.getElementById('contentContainer'),
      paginationContainer: document.getElementById('paginationContainer'),
      resultsSummary: document.getElementById('resultsSummary'),
      apiStatusBadge: document.getElementById('apiStatusBadge')
    };
  }

  /**
   * Load and apply saved theme preference
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('wdf_theme_25cs084') || 'light';
    applyTheme(savedTheme);

    if (dom.themeToggleBtn) {
      dom.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem('wdf_theme_25cs084', nextTheme);
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (dom.themeIcon) {
      if (theme === 'dark') {
        // Moon icon for dark mode
        dom.themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      } else {
        // Sun icon for light mode
        dom.themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      }
    }
  }

  /**
   * Asynchronously load data for current dataset using Fetch API
   */
  async function loadData(forceRefresh = false) {
    const currentState = PortalState.getState();
    const datasetKey = currentState.dataset;

    PortalState.setLoading(true);

    if (dom.apiStatusBadge) {
      dom.apiStatusBadge.textContent = `Fetching ${datasetKey}.json...`;
      dom.apiStatusBadge.className = 'status-pill status-fetching';
    }

    const startTime = performance.now();

    try {
      const data = await PortalAPI.fetchDataset(datasetKey, forceRefresh);
      const elapsed = Math.round(performance.now() - startTime);

      PortalState.setRawData(data);

      if (dom.apiStatusBadge) {
        dom.apiStatusBadge.textContent = `Fetched ${data.length} records in ${elapsed}ms`;
        dom.apiStatusBadge.className = 'status-pill status-success';
      }

      // Update dynamic filter dropdown options
      updateFilterDropdowns();
      updateSortDropdown();
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      console.error('Fetch error:', err);

      PortalState.setError(err.message || 'Network request failed.');

      if (dom.apiStatusBadge) {
        dom.apiStatusBadge.textContent = `Fetch Failed (${elapsed}ms)`;
        dom.apiStatusBadge.className = 'status-pill status-error';
      }
    }
  }

  /**
   * Update category and secondary dropdowns based on current dataset values
   */
  function updateFilterDropdowns() {
    const currentState = PortalState.getState();
    const options = PortalState.getFilterOptions();

    // 1. Primary Filter (Branch for students, Category for others)
    if (dom.filterCategory) {
      const currentVal = currentState.filterCategory;
      const label = currentState.dataset === 'students' ? 'All Departments / Branches' : 'All Categories';
      
      let html = `<option value="all">${label}</option>`;
      options.primary.forEach(cat => {
        const selected = cat === currentVal ? 'selected' : '';
        html += `<option value="${escapeAttr(cat)}" ${selected}>${escapeAttr(cat)}</option>`;
      });
      dom.filterCategory.innerHTML = html;
    }

    // 2. Secondary Filter (Status)
    if (dom.filterSecondary) {
      const currentVal = currentState.filterSecondary;
      let html = '<option value="all">All Statuses</option>';
      options.secondary.forEach(stat => {
        const selected = stat === currentVal ? 'selected' : '';
        html += `<option value="${escapeAttr(stat)}" ${selected}>${escapeAttr(stat)}</option>`;
      });
      dom.filterSecondary.innerHTML = html;
    }
  }

  /**
   * Update sort field options according to current dataset
   */
  function updateSortDropdown() {
    if (!dom.sortBy) return;
    const currentState = PortalState.getState();
    const list = SORT_OPTIONS[currentState.dataset] || [];

    let html = '';
    list.forEach(opt => {
      const selected = opt.value === currentState.sortBy ? 'selected' : '';
      html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
    });
    dom.sortBy.innerHTML = html;
  }

  function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  /**
   * Main Render Subscriber responding to state updates
   */
  function onStateChange(currentState, results) {
    // 1. Loading State
    if (currentState.isLoading) {
      PortalRenderer.renderLoading(dom.contentContainer);
      if (dom.paginationContainer) dom.paginationContainer.style.display = 'none';
      if (dom.resultsSummary) dom.resultsSummary.textContent = 'Loading records...';
      return;
    }

    // 2. Error State
    if (currentState.error) {
      PortalRenderer.renderError(
        dom.contentContainer,
        currentState.error,
        () => loadData(true),
        () => loadFallbackData(currentState.dataset)
      );
      if (dom.paginationContainer) dom.paginationContainer.style.display = 'none';
      if (dom.resultsSummary) dom.resultsSummary.textContent = 'Error loading dataset';
      return;
    }

    // 3. Update Results Summary Banner
    if (dom.resultsSummary) {
      if (results.filteredCount === 0) {
        dom.resultsSummary.innerHTML = `Found <strong>0</strong> matching records`;
      } else {
        dom.resultsSummary.innerHTML = `
          Showing <strong>${results.startIndex}–${results.endIndex}</strong> of <strong>${results.filteredCount}</strong> records 
          ${currentState.searchQuery ? `(matching "<em>${currentState.searchQuery}</em>")` : ''}
        `;
      }
    }

    // 4. Empty State
    if (results.filteredCount === 0) {
      PortalRenderer.renderEmpty(dom.contentContainer, currentState.searchQuery, () => {
        PortalState.resetFilters();
        if (dom.searchInput) dom.searchInput.value = '';
        if (dom.filterCategory) dom.filterCategory.value = 'all';
        if (dom.filterSecondary) dom.filterSecondary.value = 'all';
      });
      if (dom.paginationContainer) dom.paginationContainer.style.display = 'none';
      return;
    }

    // 5. Render Active View
    const onViewDetails = (item, type) => PortalRenderer.showModal(item, type);

    if (currentState.dataset === 'events') {
      PortalRenderer.renderEvents(results.items, dom.contentContainer, currentState.searchQuery, onViewDetails);
    } else if (currentState.dataset === 'students') {
      PortalRenderer.renderStudents(results.items, dom.contentContainer, currentState.searchQuery, onViewDetails);
    } else if (currentState.dataset === 'faqs') {
      PortalRenderer.renderFaqs(results.items, dom.contentContainer, currentState.searchQuery, onViewDetails);
    }

    // 6. Render Pagination
    if (dom.paginationContainer) {
      PortalRenderer.renderPagination(results, dom.paginationContainer, (newPage) => {
        PortalState.setPage(newPage);
        window.scrollTo({ top: dom.contentContainer.offsetTop - 80, behavior: 'smooth' });
      });
    }

    // 7. Update Sort Direction Icon
    if (dom.sortOrderBtn && dom.sortOrderIcon) {
      const isAsc = currentState.sortOrder === 'asc';
      dom.sortOrderBtn.setAttribute('title', isAsc ? 'Ascending (A to Z, Low to High)' : 'Descending (Z to A, High to Low)');
      dom.sortOrderIcon.textContent = isAsc ? '▲ ASC' : '▼ DESC';
    }

    // 8. Update Clear Button Visibility
    if (dom.searchClearBtn) {
      dom.searchClearBtn.style.display = currentState.searchQuery ? 'block' : 'none';
    }
  }

  /**
   * Fallback embedded data loader in case of local file:// restrictions
   */
  async function loadFallbackData(datasetKey) {
    if (dom.apiStatusBadge) {
      dom.apiStatusBadge.textContent = `Loading fallback data for ${datasetKey}...`;
      dom.apiStatusBadge.className = 'status-pill status-fetching';
    }

    try {
      // Fetch directly from relative path or load pre-parsed dataset
      const res = await fetch(`./${datasetKey}.json`);
      const data = await res.json();
      PortalState.setRawData(data);
      updateFilterDropdowns();
      updateSortDropdown();
    } catch (e) {
      console.warn('Fallback fetch also restricted, using bundled records:', e);
      // Hardcoded fallback safety net
      alert(`Tip: Modern browsers block local file:// fetch(). For the best experience, run a local web server (e.g., 'python -m http.server 8000' or VS Code Live Server) in this folder.`);
    }
  }

  /**
   * Bind all DOM event listeners
   */
  function bindEvents() {
    // 1. Dataset Tabs
    dom.datasetTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const dataset = e.currentTarget.getAttribute('data-dataset');
        if (!dataset) return;

        dom.datasetTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');

        PortalState.setDataset(dataset);
        if (dom.searchInput) dom.searchInput.value = '';

        loadData();
      });
    });

    // 2. Search Input with debouncing
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        const query = e.target.value;
        searchTimer = setTimeout(() => {
          PortalState.setSearchQuery(query);
        }, 250);
      });

      // Clear search button
      if (dom.searchClearBtn) {
        dom.searchClearBtn.addEventListener('click', () => {
          dom.searchInput.value = '';
          dom.searchInput.focus();
          PortalState.setSearchQuery('');
        });
      }
    }

    // Global keyboard shortcut '/' to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== dom.searchInput) {
        e.preventDefault();
        dom.searchInput.focus();
        dom.searchInput.select();
      }
    });

    // 3. Category Filter Dropdown
    if (dom.filterCategory) {
      dom.filterCategory.addEventListener('change', (e) => {
        PortalState.setFilterCategory(e.target.value);
      });
    }

    // 4. Secondary Filter Dropdown
    if (dom.filterSecondary) {
      dom.filterSecondary.addEventListener('change', (e) => {
        PortalState.setFilterSecondary(e.target.value);
      });
    }

    // 5. Sort By Field
    if (dom.sortBy) {
      dom.sortBy.addEventListener('change', (e) => {
        PortalState.setSortBy(e.target.value);
      });
    }

    // 6. Sort Order Toggle Button
    if (dom.sortOrderBtn) {
      dom.sortOrderBtn.addEventListener('click', () => {
        PortalState.setSortOrder();
      });
    }

    // 7. Page Size Selector
    if (dom.pageSize) {
      dom.pageSize.addEventListener('change', (e) => {
        PortalState.setPageSize(e.target.value);
      });
    }

    // 8. Reset All Filters Button
    if (dom.btnResetFilters) {
      dom.btnResetFilters.addEventListener('click', () => {
        PortalState.resetFilters();
        if (dom.searchInput) dom.searchInput.value = '';
        if (dom.filterCategory) dom.filterCategory.value = 'all';
        if (dom.filterSecondary) dom.filterSecondary.value = 'all';
      });
    }

    // 9. Simulate Error Button (for testing error handling)
    if (dom.btnSimulateError) {
      dom.btnSimulateError.addEventListener('click', () => {
        const cfg = PortalAPI.getConfig();
        const next = !cfg.simulateError;
        PortalAPI.setSimulateError(next);
        dom.btnSimulateError.classList.toggle('active-toggle', next);
        dom.btnSimulateError.innerHTML = next 
          ? `❌ Error Active (Click to Disable)` 
          : `⚠️ Simulate Error`;
        loadData(true);
      });
    }

    // 10. Simulate Latency Toggle (for testing loading state)
    if (dom.btnSimulateLatency) {
      dom.btnSimulateLatency.addEventListener('click', () => {
        const cfg = PortalAPI.getConfig();
        const next = !cfg.simulateLatency;
        PortalAPI.setLatency(next, 450);
        dom.btnSimulateLatency.classList.toggle('active-toggle', next);
        dom.btnSimulateLatency.textContent = next ? '⏳ Delay: 450ms' : '⚡ Delay: Off';
      });
    }
  }

  /**
   * Bootstraps the application
   */
  function init() {
    cacheDom();
    initTheme();
    PortalState.subscribe(onStateChange);
    bindEvents();

    // Initial data load
    loadData();
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    loadData
  };
});
