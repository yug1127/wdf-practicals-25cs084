/**
 * ========================================================
 * PRACTICAL 4: JAVASCRIPT DOM MANIPULATION & INTERACTION
 * Candidate: Yug Patel | Roll No: 25CS084
 * Description: Dynamic UI components, Event Listeners,
 *              LocalStorage Theme Persistence & A11y.
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 0. EVENT LOGGER & LIVE MONITOR HELPER UTILITIES
  // ========================================================
  const eventLogList = document.getElementById('event-log-list');
  const clearLogBtn = document.getElementById('clear-log-btn');
  const monitorThemeVal = document.getElementById('monitor-theme-val');
  const monitorSlideVal = document.getElementById('monitor-slide-val');
  const monitorAutoplayVal = document.getElementById('monitor-autoplay-val');
  const monitorModalVal = document.getElementById('monitor-modal-val');
  const monitorModalDot = document.getElementById('monitor-modal-dot');
  const monitorBannerVal = document.getElementById('monitor-banner-val');
  const monitorBannerDot = document.getElementById('monitor-banner-dot');

  /**
   * Appends an event entry to the live stream
   * @param {string} text - Message describing DOM event
   * @param {'system'|'event'|'normal'} type - Style modifier
   */
  function logActivity(text, type = 'event') {
    if (!eventLogList) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const li = document.createElement('li');
    li.className = `log-entry log-${type}`;
    li.innerHTML = `<strong>[${timeStr}]</strong> ${text}`;
    eventLogList.prepend(li);

    // Limit log length to last 25 entries for performance
    if (eventLogList.children.length > 25) {
      eventLogList.removeChild(eventLogList.lastElementChild);
    }
  }

  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      eventLogList.innerHTML = '';
      logActivity('Activity log cleared by user', 'system');
    });
  }


  // ========================================================
  // 1. LIGHT / DARK THEME & LOCALSTORAGE CONTROLLER
  // ========================================================
  const THEME_STORAGE_KEY = 'wdf_theme_25cs084';
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const mobileThemeBtn = document.getElementById('mobile-theme-btn');
  const themeStatusText = document.getElementById('theme-status-text');

  /**
   * Applies the requested theme to document and updates storage
   * @param {'light'|'dark'} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (themeStatusText) {
      themeStatusText.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    if (monitorThemeVal) {
      monitorThemeVal.textContent = theme;
    }

    logActivity(`Theme changed to [${theme.toUpperCase()}] and saved to localStorage.`, 'system');
  }

  /**
   * Initializes theme on page load from localStorage or system preference
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function toggleCurrentTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleCurrentTheme);
  }

  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', toggleCurrentTheme);
  }

  // Initialize theme immediately
  initTheme();


  // ========================================================
  // 2. NOTIFICATION BANNER CONTROLLER (Dismiss & Restore)
  // ========================================================
  const notificationBanner = document.getElementById('notification-banner');
  const bannerCloseBtn = document.getElementById('banner-close-btn');
  const bannerActionBtn = document.getElementById('banner-action-btn');
  const restoreBannerBtn = document.getElementById('restore-banner-btn');

  function dismissBanner() {
    if (!notificationBanner) return;
    notificationBanner.classList.add('dismissed');
    if (monitorBannerVal) monitorBannerVal.textContent = 'Dismissed';
    if (monitorBannerDot) monitorBannerDot.classList.remove('active');
    logActivity('Notification banner dismissed via close button.');
  }

  function restoreBanner() {
    if (!notificationBanner) return;
    notificationBanner.classList.remove('dismissed');
    if (monitorBannerVal) monitorBannerVal.textContent = 'Visible';
    if (monitorBannerDot) monitorBannerDot.classList.add('active');
    logActivity('Notification banner restored to view.');
  }

  if (bannerCloseBtn) {
    bannerCloseBtn.addEventListener('click', dismissBanner);
  }

  if (restoreBannerBtn) {
    restoreBannerBtn.addEventListener('click', restoreBanner);
  }

  if (bannerActionBtn) {
    bannerActionBtn.addEventListener('click', () => {
      const sliderEl = document.getElementById('slider-section');
      if (sliderEl) {
        sliderEl.scrollIntoView({ behavior: 'smooth' });
        logActivity('Banner action clicked: Smooth-scrolled to Content Slider section.');
      }
    });
  }


  // ========================================================
  // 3. RESPONSIVE HAMBURGER NAVIGATION DRAWER
  // ========================================================
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileNav() {
    if (!mobileNav || !hamburgerBtn) return;
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    const willOpen = !isExpanded;

    hamburgerBtn.setAttribute('aria-expanded', String(willOpen));
    hamburgerBtn.classList.toggle('active', willOpen);
    mobileNav.classList.toggle('open', willOpen);
    mobileNav.setAttribute('aria-hidden', String(!willOpen));

    logActivity(`Mobile navigation drawer ${willOpen ? 'opened' : 'closed'} (aria-expanded: ${willOpen}).`);
  }

  function closeMobileNav() {
    if (!mobileNav || !hamburgerBtn) return;
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.classList.remove('active');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
      logActivity(`Mobile nav link [${link.textContent}] tapped. Drawer closed.`);
    });
  });

  // Close mobile drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileNav && mobileNav.classList.contains('open')) {
      if (!mobileNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        closeMobileNav();
      }
    }
  });


  // ========================================================
  // 4. IMAGE & CONTENT SLIDER (CAROUSEL) CONTROLLER
  // ========================================================
  const sliderTrack = document.getElementById('slider-track');
  const sliderSlides = document.querySelectorAll('.slider-slide');
  const sliderPrevBtn = document.getElementById('slider-prev-btn');
  const sliderNextBtn = document.getElementById('slider-next-btn');
  const sliderDots = document.querySelectorAll('.slider-dot');
  const sliderCounter = document.getElementById('slider-counter');
  const sliderAutoplayBtn = document.getElementById('slider-autoplay-btn');
  const autoplayIcon = document.getElementById('autoplay-icon');
  const autoplayText = document.getElementById('autoplay-text');
  const sliderViewport = document.getElementById('slider-viewport');

  let currentSlideIndex = 0;
  const totalSlides = sliderSlides.length;
  let autoplayInterval = null;
  let isAutoplayActive = true;
  const AUTOPLAY_DELAY_MS = 4500;

  /**
   * Updates slider position, dots, counters, and monitoring
   * @param {number} targetIndex
   */
  function goToSlide(targetIndex) {
    if (totalSlides === 0) return;

    // Wrap-around bounds handling
    if (targetIndex < 0) {
      currentSlideIndex = totalSlides - 1;
    } else if (targetIndex >= totalSlides) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = targetIndex;
    }

    // Transform track
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    // Update Dots & ARIA
    sliderDots.forEach((dot, idx) => {
      const isActive = idx === currentSlideIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    // Update Counter Display (e.g. 01 / 04)
    if (sliderCounter) {
      sliderCounter.textContent = `${String(currentSlideIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }

    // Update Live Monitor Card
    if (monitorSlideVal) {
      monitorSlideVal.textContent = `Slide ${currentSlideIndex + 1} of ${totalSlides}`;
    }

    logActivity(`Slider shifted to Slide ${currentSlideIndex + 1} (${sliderSlides[currentSlideIndex]?.querySelector('.slide-heading')?.textContent || ''}).`);
  }

  function nextSlide() {
    goToSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentSlideIndex - 1);
  }

  // Next and Previous Button Listeners
  if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoplayTimer();
    });
  }

  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoplayTimer();
    });
  }

  // Pagination Dot Buttons Listeners
  sliderDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      restartAutoplayTimer();
    });
  });

  // Autoplay Logic
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY_MS);
    isAutoplayActive = true;
    if (autoplayIcon) autoplayIcon.textContent = '⏸';
    if (autoplayText) autoplayText.textContent = 'Pause Autoplay';
    if (monitorAutoplayVal) {
      monitorAutoplayVal.textContent = 'Active';
      monitorAutoplayVal.classList.remove('badge-paused');
    }
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
    isAutoplayActive = false;
    if (autoplayIcon) autoplayIcon.textContent = '▶';
    if (autoplayText) autoplayText.textContent = 'Resume Autoplay';
    if (monitorAutoplayVal) {
      monitorAutoplayVal.textContent = 'Paused';
      monitorAutoplayVal.classList.add('badge-paused');
    }
  }

  function restartAutoplayTimer() {
    if (isAutoplayActive) {
      startAutoplay();
    }
  }

  if (sliderAutoplayBtn) {
    sliderAutoplayBtn.addEventListener('click', () => {
      if (isAutoplayActive) {
        stopAutoplay();
        logActivity('Slider autoplay paused by user.');
      } else {
        startAutoplay();
        logActivity('Slider autoplay resumed by user.');
      }
    });
  }

  // Pause on hover
  if (sliderViewport) {
    sliderViewport.addEventListener('mouseenter', () => {
      if (isAutoplayActive && autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    });

    sliderViewport.addEventListener('mouseleave', () => {
      if (isAutoplayActive) {
        restartAutoplayTimer();
      }
    });

    // Keyboard navigation when viewport has focus
    sliderViewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
        restartAutoplayTimer();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        restartAutoplayTimer();
      }
    });
  }

  // Start autoplay initially
  startAutoplay();


  // ========================================================
  // 5. ACCESSIBLE MODAL DIALOG CONTROLLER
  // ========================================================
  const modalOverlay = document.getElementById('demo-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseIconBtn = document.getElementById('modal-close-icon-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const modalTriggerBtns = document.querySelectorAll('.modal-trigger-btn, #hero-modal-trigger');
  const modalInput = document.getElementById('modal-input');
  const modalTestActionBtn = document.getElementById('modal-test-action-btn');
  const modalActionFeedback = document.getElementById('modal-action-feedback');

  let lastActiveElement = null;

  function openModal() {
    if (!modalOverlay) return;
    lastActiveElement = document.activeElement;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');

    // Update Monitor
    if (monitorModalVal) monitorModalVal.textContent = 'Open';
    if (monitorModalDot) monitorModalDot.classList.add('active');

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Focus close button or input inside modal for accessibility
    setTimeout(() => {
      if (modalInput) modalInput.focus();
    }, 100);

    logActivity('Modal dialog opened (aria-hidden: false).');
  }

  function closeModal() {
    if (!modalOverlay || !modalOverlay.classList.contains('open')) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Update Monitor
    if (monitorModalVal) monitorModalVal.textContent = 'Closed';
    if (monitorModalDot) monitorModalDot.classList.remove('active');

    // Restore focus to opener element
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }

    logActivity('Modal dialog closed (aria-hidden: true).');
  }

  modalTriggerBtns.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (modalCloseIconBtn) {
    modalCloseIconBtn.addEventListener('click', closeModal);
  }

  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // Confirm button in modal
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', () => {
      const val = modalInput ? modalInput.value.trim() : '';
      logActivity(`Modal confirmed with payload: "${val || 'Empty input'}"`);
      closeModal();
    });
  }

  // Interactive dispatch button inside modal
  if (modalTestActionBtn) {
    modalTestActionBtn.addEventListener('click', () => {
      const val = modalInput ? modalInput.value.trim() : '';
      if (modalActionFeedback) {
        modalActionFeedback.textContent = `✓ DOM Event logged successfully: "${val || 'Sample payload'}"`;
        setTimeout(() => {
          modalActionFeedback.textContent = '';
        }, 3000);
      }
      logActivity(`Interactive input event dispatched: "${val}"`);
    });
  }

  // Global ESC key listener to dismiss modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });


  // ========================================================
  // 6. DYNAMIC FAQ ACCORDION CONTROLLER
  // ========================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      if (isOpen) {
        item.classList.remove('open');
        questionBtn.setAttribute('aria-expanded', 'false');
        logActivity(`FAQ Item #${index + 1} collapsed.`);
      } else {
        item.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
        const questionText = item.querySelector('.faq-question-text')?.textContent || `Question ${index + 1}`;
        logActivity(`FAQ Item #${index + 1} expanded: "${questionText.substring(0, 35)}..."`);
      }
    });
  });

  // Ready system log
  logActivity('All interactive components ready: FAQ, Modal, Slider, Banner, Nav & LocalStorage theme.', 'system');

});
