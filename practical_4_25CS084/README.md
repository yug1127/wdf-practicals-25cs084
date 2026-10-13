# Practical 4: Dynamic UI & Client-Side DOM Manipulation

- **Course:** Web Development Frameworks (WDF)
- **Student Name:** Yug Patel
- **Roll Number:** 25CS084
- **Directory:** `practical_4_25CS084`
- **Submission Date:** October 2026 (Due: 27 September 2026)

---

## 🎯 Practical Objectives & Submission Points

This submission satisfies all required points:

| Submission Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Dynamic UI** | Interactive FAQ accordion, Modal popup dialog, Content/Card Slider, Notification Banner, Responsive Hamburger menu, and Light/Dark theme. | ✅ Complete |
| **JavaScript DOM** | Selection and manipulation using `document.getElementById()`, `querySelector()`, `classList.toggle()`, `setAttribute()`, and inline styles. | ✅ Complete |
| **Event Handling** | Comprehensive event listeners for `click`, `keydown` (<kbd>Escape</kbd>, <kbd>ArrowLeft</kbd>, <kbd>ArrowRight</kbd>), `mouseenter`, `mouseleave`, and input events. | ✅ Complete |
| **localStorage** | Persists light/dark color theme preference under key `wdf_theme_25cs084`. Survives browser refreshes and sessions. | ✅ Complete |
| **CSS / Animation** | Smooth hardware-accelerated transitions, rotating icons, hamburger-to-X morphing, backdrop blur, and cubic-bezier easing. | ✅ Complete |
| **Accessibility (A11y)** | Semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`), `aria-expanded`, `aria-hidden`, `aria-selected`, and keyboard focus rings. | ✅ Complete |

---

## 📂 File Structure

```text
practical_4_25CS084/
├── index.html       # Semantic HTML5 markup containing all 6 dynamic components
├── style.css        # Responsive CSS styling, CSS variables for light/dark themes & animations
├── script.js        # Vanilla JavaScript DOM manipulation, event listeners & localStorage logic
└── README.md        # Comprehensive documentation & evaluation instructions
```

---

## 🛠️ Component Breakdown & Features

### 1. Dynamic FAQ Accordion (`#faq-accordion`)
- **Structure:** Expandable question/answer cards built with `<article class="faq-item">` and `<button class="faq-question">`.
- **Interaction:** Clicking any question toggles the `.open` class and flips the chevron icon smoothly.
- **Accessibility:** Dynamically sets `aria-expanded="true"` or `"false"`. Supports keyboard activation with <kbd>Enter</kbd> and <kbd>Space</kbd>.
- **Independent State:** Allows multi-expansion or single-expansion for comparing topics.

### 2. Accessible Modal Popup (`#demo-modal`)
- **Structure:** Fixed dialog overlay with backdrop blur (`backdrop-filter: blur(8px)`).
- **Trigger:** Accessible from multiple locations (Header quick button, Hero action button, and Section trigger button).
- **Dismissal Methods:**
  1. Top-right close button (<kbd>×</kbd>).
  2. "Close" button in modal footer.
  3. Clicking outside the modal container on the shaded backdrop.
  4. Pressing the <kbd>Escape</kbd> key anywhere on the page.
- **Focus Management:** Traps focus onto the interactive input and restores focus to the triggering element upon exit.

### 3. Image & Content Slider (Carousel) (`#slider-wrapper`)
- **Structure:** Flex track container displaying styled modular presentation cards with statistics, badges, and typography.
- **Controls:**
  - **Previous & Next Buttons:** Animated arrow controls cycling through slides with boundary wrap-around.
  - **Pagination Indicators:** Interactive pill dots reflecting the active slide with `aria-selected` status.
  - **Slide Counter:** Displays formatted position indicator (`01 / 04`).
- **Autoplay & Hover Control:** Automatic progression every 4.5 seconds with play/pause button and automatic pause when hovering over the viewport (`mouseenter` / `mouseleave`).
- **Keyboard Navigation:** <kbd>ArrowLeft</kbd> and <kbd>ArrowRight</kbd> keys cycle through slides when the slider region is focused.

### 4. Responsive Hamburger Menu (`#hamburger-btn` & `#mobile-nav`)
- **Mobile Responsive:** Seamlessly visible on viewport widths under 768px.
- **Animated Morphing:** 3 horizontal bars smoothly morph into a close <kbd>X</kbd> using CSS transforms (`translateY` + `rotate(45deg)`).
- **Drawer Animation:** Slide-down container displaying responsive navigation links.
- **Auto-Close:** Automatically closes when any navigation link is clicked or when clicking outside the menu drawer.

### 5. Persistent Light / Dark Theme (`#theme-toggle-btn`)
- **Color Variables:** Comprehensive CSS token system (`--bg-main`, `--text-primary`, `--accent-primary`, etc.) defined under `[data-theme="light"]` and `[data-theme="dark"]`.
- **Micro-Animations:** Rotating Sun and Moon icons transition smoothly with spring easing.
- **Persistence Logic:**
  ```javascript
  // Read on initial load
  const savedTheme = localStorage.getItem('wdf_theme_25cs084');
  // Store when toggled
  localStorage.setItem('wdf_theme_25cs084', nextTheme);
  ```

### 6. Dismissible Notification Banner (`#notification-banner`)
- **Top Announcement Bar:** Features alert icon, call-to-action button, and dismiss button.
- **Smooth Animation:** Fades out and slides upwards without jarring layout shifts.
- **Reset Trigger:** The hero section includes a **"Reset Notification Banner"** button to restore the banner for testing and demonstration.

### 7. Live DOM Inspector & Event Stream (`#status-panel`)
- **Real-Time Indicators:** Visual cards showing current Theme, Active Slide, Modal State, and Banner Visibility in real-time.
- **Live Activity Stream:** Displays timestamped log entries for every DOM event dispatched by user actions.

---

## 🚀 How to Run and Test Locally

1. Open this folder in any web browser:
   - Double click `index.html` directly in File Explorer, OR
   - Run a local HTTP server using Python:
     ```bash
     cd "practical_4_25CS084"
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` in your browser.

2. **Testing Guide:**
   - **Theme Switcher:** Click the theme toggle button in the header; observe the color transition; refresh the page (`F5`) to confirm `localStorage` persists the chosen theme.
   - **Slider:** Click Next/Prev arrows, click the pagination dots, press arrow keys, and toggle autoplay pause.
   - **Modal:** Click "Launch Modal Popup", type into the interactive test input, test closing via the close button, clicking the backdrop, and pressing the <kbd>Esc</kbd> key.
   - **FAQ:** Click questions to expand/collapse answers.
   - **Banner:** Click the <kbd>×</kbd> button on the top banner to dismiss it, then scroll down and click "Reset Notification Banner" to bring it back.
   - **Hamburger Menu:** Resize your browser window below 768px (or inspect mobile view) and click the hamburger icon.
