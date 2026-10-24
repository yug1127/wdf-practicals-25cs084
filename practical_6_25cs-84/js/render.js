/**
 * Modular JS: UI & Component Rendering Module
 * Responsible for dynamic DOM rendering, card templates, accordions, loading skeletons, error screens, and pagination.
 * Practical 6 - Yug Patel (25CS084)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PortalRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Highlight search keywords inside text
   */
  function highlightText(text, query) {
    if (!text) return '';
    const safeText = escapeHTML(String(text));
    if (!query || !query.trim()) return safeText;

    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return safeText.replace(regex, '<mark class="highlight">$1</mark>');
  }

  /**
   * Render loading skeleton and spinner
   */
  function renderLoading(container) {
    container.innerHTML = `
      <div class="loading-state" role="status" aria-live="polite">
        <div class="spinner-container">
          <div class="modern-spinner"></div>
          <p class="loading-text">Fetching live data via <code>fetch()</code> API...</p>
          <span class="loading-subtext">Executing asynchronous HTTP request</span>
        </div>
        <div class="skeleton-grid">
          ${Array.from({ length: 4 }).map(() => `
            <div class="skeleton-card">
              <div class="skeleton-line skeleton-header"></div>
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-body"></div>
              <div class="skeleton-line skeleton-body short"></div>
              <div class="skeleton-footer">
                <div class="skeleton-pill"></div>
                <div class="skeleton-pill"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render error state with retry and fallback options
   */
  function renderError(container, errorMessage, onRetry, onFallback) {
    container.innerHTML = `
      <div class="state-card error-card" role="alert">
        <div class="state-icon error-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Failed to Fetch Dataset</h3>
        <p class="error-desc">${escapeHTML(errorMessage || 'An unexpected error occurred during fetch().')}</p>
        
        <div class="error-tip">
          <strong>Tip for Local Testing:</strong> If opening via <code>file:///</code>, browsers block local <code>fetch()</code> due to CORS security. 
          Run a local server (e.g. <code>python -m http.server 8000</code> or VS Code Live Server) or use the fallback data button below.
        </div>

        <div class="error-actions">
          <button class="btn btn-primary" id="btnRetryFetch">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Retry Fetch
          </button>
          ${onFallback ? `
            <button class="btn btn-secondary" id="btnLoadFallback">
              Load Embedded Fallback Data
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const retryBtn = container.querySelector('#btnRetryFetch');
    if (retryBtn && typeof onRetry === 'function') {
      retryBtn.addEventListener('click', onRetry);
    }

    const fallbackBtn = container.querySelector('#btnLoadFallback');
    if (fallbackBtn && typeof onFallback === 'function') {
      fallbackBtn.addEventListener('click', onFallback);
    }
  }

  /**
   * Render empty state when search/filter has 0 matches
   */
  function renderEmpty(container, query, onReset) {
    container.innerHTML = `
      <div class="state-card empty-card">
        <div class="state-icon empty-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3>No Matching Records Found</h3>
        <p class="empty-desc">
          ${query ? `No records matched your search query "<strong>${escapeHTML(query)}</strong>".` : 'No records match the current filter criteria.'}
        </p>
        <button class="btn btn-secondary" id="btnResetFiltersEmpty">
          Clear All Filters & Reset Search
        </button>
      </div>
    `;

    const resetBtn = container.querySelector('#btnResetFiltersEmpty');
    if (resetBtn && typeof onReset === 'function') {
      resetBtn.addEventListener('click', onReset);
    }
  }

  /**
   * Render Campus Events Grid
   */
  function renderEvents(items, container, query, onViewDetails) {
    if (!items || items.length === 0) return;

    const cardsHtml = items.map(event => {
      const fillPercentage = Math.min(100, Math.round((event.registered / (event.capacity || 1)) * 100));
      const isFull = event.status === 'Registration Closed' || fillPercentage >= 100;
      const statusClass = isFull ? 'badge-closed' : 'badge-open';
      const feeLabel = event.fee === 0 ? 'FREE' : `₹${event.fee}`;
      const feeClass = event.fee === 0 ? 'badge-free' : 'badge-paid';

      return `
        <article class="card event-card" data-id="${escapeHTML(event.id)}">
          <div class="card-header">
            <span class="badge badge-category badge-${(event.category || '').toLowerCase()}">
              ${escapeHTML(event.category)}
            </span>
            <div class="header-pills">
              <span class="badge badge-fee ${feeClass}">${feeLabel}</span>
              <span class="badge ${statusClass}">${escapeHTML(event.status)}</span>
            </div>
          </div>

          <h3 class="card-title">
            ${highlightText(event.title, query)}
          </h3>

          <p class="card-desc">
            ${highlightText(event.description, query)}
          </p>

          <div class="card-meta-list">
            <div class="meta-row">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span><strong>${escapeHTML(event.date)}</strong> at ${escapeHTML(event.time)}</span>
            </div>

            <div class="meta-row">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${highlightText(event.venue, query)}</span>
            </div>

            <div class="meta-row">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>${highlightText(event.organizer, query)}</span>
            </div>
          </div>

          <div class="capacity-meter">
            <div class="meter-info">
              <span>Registrations</span>
              <span><strong>${event.registered}</strong> / ${event.capacity} seats (${fillPercentage}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${fillPercentage > 90 ? 'fill-warning' : ''}" style="width: ${fillPercentage}%"></div>
            </div>
          </div>

          <div class="card-tags">
            ${Array.isArray(event.tags) ? event.tags.map(t => `<span class="tag-pill">${highlightText(t, query)}</span>`).join('') : ''}
          </div>

          <div class="card-footer">
            <span class="rating-badge">
              ⭐ ${event.rating || '4.8'}
            </span>
            <button class="btn btn-outline btn-details" data-id="${escapeHTML(event.id)}">
              View Details
            </button>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = `<div class="grid-container cards-grid">${cardsHtml}</div>`;

    // Attach click listeners for View Details
    container.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = items.find(it => it.id === id);
        if (item && typeof onViewDetails === 'function') {
          onViewDetails(item, 'event');
        }
      });
    });
  }

  /**
   * Render Student Directory Cards
   */
  function renderStudents(items, container, query, onViewDetails) {
    if (!items || items.length === 0) return;

    const cardsHtml = items.map(student => {
      const isRoll84 = (student.rollNumber || '').toUpperCase().includes('25CS084');
      const cardHighlightClass = isRoll84 ? 'student-highlight-card' : '';
      const statusClass = student.status === 'Honor Roll' ? 'badge-gold' : student.status === 'Internship' ? 'badge-blue' : 'badge-green';

      return `
        <article class="card student-card ${cardHighlightClass}" data-id="${escapeHTML(student.id)}">
          <div class="student-header">
            <div class="student-avatar ${isRoll84 ? 'avatar-star' : ''}">
              ${escapeHTML(student.avatar || student.name.substring(0, 2).toUpperCase())}
            </div>
            <div class="student-title-block">
              <div class="student-name-row">
                <h3 class="student-name">${highlightText(student.name, query)}</h3>
                ${isRoll84 ? '<span class="badge badge-author">Author 25CS084</span>' : ''}
              </div>
              <span class="roll-pill">${highlightText(student.rollNumber, query)}</span>
            </div>
            <span class="badge ${statusClass}">${escapeHTML(student.status)}</span>
          </div>

          <div class="student-details-grid">
            <div class="detail-box">
              <span class="detail-label">Department</span>
              <span class="detail-value branch-value">${highlightText(student.branch, query)}</span>
            </div>
            <div class="detail-box">
              <span class="detail-label">Semester</span>
              <span class="detail-value">Sem ${student.semester}</span>
            </div>
            <div class="detail-box">
              <span class="detail-label">CGPA</span>
              <span class="detail-value cgpa-value">⭐ ${student.cgpa}</span>
            </div>
            <div class="detail-box">
              <span class="detail-label">Attendance</span>
              <span class="detail-value attendance-value">${escapeHTML(student.attendance || '90%')}</span>
            </div>
          </div>

          <div class="student-contact-info">
            <a href="mailto:${escapeHTML(student.email)}" class="contact-link">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>${highlightText(student.email, query)}</span>
            </a>
            <div class="contact-location">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${highlightText(student.city, query)}</span>
            </div>
          </div>

          <div class="student-skills">
            <span class="skills-label">Technical Skills:</span>
            <div class="skills-wrap">
              ${Array.isArray(student.skills) ? student.skills.map(s => `<span class="skill-tag">${highlightText(s, query)}</span>`).join('') : ''}
            </div>
          </div>

          <div class="card-footer student-footer">
            <span class="subtext">Student ID: ${escapeHTML(student.id)}</span>
            <button class="btn btn-outline btn-details" data-id="${escapeHTML(student.id)}">
              View Profile
            </button>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = `<div class="grid-container cards-grid student-grid">${cardsHtml}</div>`;

    container.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = items.find(it => it.id === id);
        if (item && typeof onViewDetails === 'function') {
          onViewDetails(item, 'student');
        }
      });
    });
  }

  /**
   * Render FAQ Knowledge Base Accordion
   */
  function renderFaqs(items, container, query, onViewDetails) {
    if (!items || items.length === 0) return;

    const accordionHtml = items.map((faq, idx) => {
      return `
        <article class="faq-item" data-id="${escapeHTML(faq.id)}">
          <button class="faq-question-btn" type="button" aria-expanded="false" id="faq-btn-${idx}">
            <div class="faq-btn-content">
              <span class="badge badge-category badge-${(faq.category || '').toLowerCase().replace(/\s+/g, '-')}">
                ${escapeHTML(faq.category)}
              </span>
              <span class="faq-question-text">
                ${highlightText(faq.question, query)}
              </span>
            </div>
            <div class="faq-btn-meta">
              <span class="faq-stats">👁️ ${faq.views} views</span>
              <span class="chevron-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
          </button>

          <div class="faq-collapse-body" id="faq-body-${idx}" hidden>
            <div class="faq-answer-inner">
              <p class="faq-answer-text">
                ${highlightText(faq.answer, query)}
              </p>

              <div class="faq-body-footer">
                <div class="faq-tags-list">
                  ${Array.isArray(faq.tags) ? faq.tags.map(t => `<span class="tag-pill">${highlightText(t, query)}</span>`).join('') : ''}
                </div>
                <div class="faq-feedback-row">
                  <span class="faq-updated">Updated: ${escapeHTML(faq.lastUpdated)}</span>
                  <button class="btn btn-helpful" data-id="${escapeHTML(faq.id)}">
                    👍 Helpful (<span class="helpful-count">${faq.helpfulCount}</span>)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = `<div class="faq-accordion-wrapper">${accordionHtml}</div>`;

    // Attach accordion toggling
    container.querySelectorAll('.faq-question-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const body = btn.nextElementSibling;

        btn.setAttribute('aria-expanded', !expanded);
        btn.classList.toggle('active', !expanded);

        if (!expanded) {
          body.hidden = false;
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          body.style.maxHeight = '0px';
          setTimeout(() => {
            if (btn.getAttribute('aria-expanded') === 'false') {
              body.hidden = true;
            }
          }, 250);
        }
      });
    });

    // Attach helpful upvote interaction
    container.querySelectorAll('.btn-helpful').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.classList.contains('voted')) return;
        const countSpan = btn.querySelector('.helpful-count');
        const current = parseInt(countSpan.textContent, 10) || 0;
        countSpan.textContent = current + 1;
        btn.classList.add('voted');
        btn.style.color = 'var(--accent-primary)';
      });
    });
  }

  /**
   * Render Pagination Controls
   */
  function renderPagination(paginationInfo, container, onPageChange) {
    const { totalPages, currentPage, filteredCount, startIndex, endIndex } = paginationInfo;

    if (filteredCount === 0 || totalPages <= 1) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';

    // Calculate visible page range (up to 5 buttons with sliding window)
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const pages = [];
    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }

    container.innerHTML = `
      <div class="pagination-summary">
        Showing <strong>${startIndex}</strong>–<strong>${endIndex}</strong> of <strong>${filteredCount}</strong> records
        <span class="page-count-badge">Page ${currentPage} of ${totalPages}</span>
      </div>

      <nav class="pagination-nav" aria-label="Pagination Navigation">
        <button class="page-btn page-nav-btn" data-page="1" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''} title="First Page">
          &laquo; First
        </button>
        <button class="page-btn page-nav-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''} title="Previous Page">
          &lsaquo; Prev
        </button>

        ${startPage > 1 ? '<span class="pagination-ellipsis">...</span>' : ''}

        <div class="page-numbers">
          ${pages.map(p => `
            <button class="page-btn page-num-btn ${p === currentPage ? 'active' : ''}" 
                    data-page="${p}" 
                    aria-current="${p === currentPage ? 'page' : 'false'}">
              ${p}
            </button>
          `).join('')}
        </div>

        ${endPage < totalPages ? '<span class="pagination-ellipsis">...</span>' : ''}

        <button class="page-btn page-nav-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled aria-disabled="true"' : ''} title="Next Page">
          Next &rsaquo;
        </button>
        <button class="page-btn page-nav-btn" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled aria-disabled="true"' : ''} title="Last Page">
          Last &raquo;
        </button>
      </nav>
    `;

    container.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.getAttribute('data-page'), 10);
        if (targetPage && typeof onPageChange === 'function') {
          onPageChange(targetPage);
        }
      });
    });
  }

  /**
   * Render details modal dialog for events or students
   */
  function showModal(item, type) {
    let existingModal = document.getElementById('detailsModal');
    if (!existingModal) {
      existingModal = document.createElement('div');
      existingModal.id = 'detailsModal';
      existingModal.className = 'modal-backdrop';
      document.body.appendChild(existingModal);
    }

    const title = type === 'event' ? item.title : item.name;
    const subtitle = type === 'event' ? `${item.category} Event • ${item.venue}` : `${item.rollNumber} • ${item.branch}`;

    existingModal.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <div>
            <h2 id="modalTitle" class="modal-title">${escapeHTML(title)}</h2>
            <p class="modal-subtitle">${escapeHTML(subtitle)}</p>
          </div>
          <button class="modal-close-btn" id="btnModalClose" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-raw-json">
            <h4>Raw Record Data (JSON):</h4>
            <pre><code>${escapeHTML(JSON.stringify(item, null, 2))}</code></pre>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="btnModalCloseAction">Close</button>
        </div>
      </div>
    `;

    existingModal.classList.add('open');

    const closeModal = () => {
      existingModal.classList.remove('open');
    };

    existingModal.querySelector('#btnModalClose').addEventListener('click', closeModal);
    existingModal.querySelector('#btnModalCloseAction').addEventListener('click', closeModal);
    existingModal.addEventListener('click', (e) => {
      if (e.target === existingModal) closeModal();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        window.removeEventListener('keydown', escHandler);
      }
    };
    window.addEventListener('keydown', escHandler);
  }

  return {
    renderLoading,
    renderError,
    renderEmpty,
    renderEvents,
    renderStudents,
    renderFaqs,
    renderPagination,
    showModal,
    highlightText
  };
});
