# Practical 6: Dynamic Data Explorer with Fetch API & Modular JavaScript

- **Course:** Web Development Frameworks (WDF)
- **Student Name:** Yug Patel
- **Roll Number:** 25CS084
- **Directory:** `practical_6_25cs-84`
- **Submission Date:** October 2026

---

## 🎯 Problem Statement & Objectives

Design and develop a dynamic web application utilizing the modern JavaScript **Fetch API** to asynchronously load, process, filter, sort, and render multiple local JSON datasets. Implement a clean **Modular JavaScript architecture** with responsive UI, loading states, error handling, real-time search, category filters, and pagination.

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **JSON Files** | Created `events.json`, `students.json`, and `faqs.json` containing 16 detailed records each (minimum requirement: 15). | ✅ Complete |
| **Fetch API** | Asynchronous HTTP data loading using modern `fetch()`, `async/await`, HTTP status validation, and caching. | ✅ Complete |
| **Dynamic Rendering** | Client-side DOM creation rendering interactive Event Cards with capacity progress bars, Student Directory cards with author highlight (`25CS084`), and expandable FAQ Accordions. | ✅ Complete |
| **Search & Filter** | Real-time debounced multi-field text search with query match highlighting (`<mark class="highlight">`), dynamic primary Category/Branch dropdowns, and Status filters. | ✅ Complete |
| **Sorting** | Dynamic multi-column sorting (Date, Title/Question, Capacity, CGPA, Views, Rating) with an **Ascending (▲ ASC)** / **Descending (▼ DESC)** order toggle. | ✅ Complete |
| **Pagination** | Client-side pagination engine supporting 6, 10, or 15 records per page, First/Prev/Next/Last controls, active page pills, and "Showing X–Y of Z" counters. | ✅ Complete |
| **Loading & Error Handling** | Shimmering card skeleton loaders (`@keyframes skeleton-shimmer`), modern CSS spinner, dedicated Error View with a **"Retry Fetch"** button, and interactive **"⚠️ Simulate Error"** toggle. | ✅ Complete |
| **Modular JavaScript** | Clean separation of concerns partitioned into 4 distinct ES modules: `api.js`, `state.js`, `render.js`, and `app.js`. | ✅ Complete |
| **Theme & Aesthetics** | Dual Dark & Light themes persisted in `localStorage` under key `wdf_theme_25cs084`, glassmorphism header, and responsive flex/grid layout. | ✅ Complete |

---

## 📂 File Architecture

```text
practical_6_25cs-84/
├── index.html            # Semantic HTML5 layout, toolbar, navigation tabs & status strip
├── style.css             # Responsive design system, CSS custom properties, dark/light themes, animations
├── events.json           # 16 detailed campus event records (hackathons, workshops, cultural, sports)
├── students.json         # 16 student directory records with CGPA, branches, skills & attendance
├── faqs.json             # 16 campus FAQ entries across admissions, exams, library, IT & scholarships
├── data/                 # Mirrored JSON directory for flexible relative path resolution
│   ├── events.json
│   ├── students.json
│   └── faqs.json
├── js/
│   ├── api.js            # Modular Fetch API service: HTTP calls, error handling, latency & caching
│   ├── state.js          # Central state management: filtering, multi-field sorting, pagination logic
│   ├── render.js         # UI rendering engine: event cards, student cards, accordions, skeletons & modal
│   └── app.js            # Main application controller: event listeners, search debouncing, tab router
└── README.md             # Documentation, evaluation rubric, and local testing instructions
```

---

## 🏗️ Modular JavaScript Breakdown

1. **`js/api.js` (Data Fetching Service)**
   - Manages asynchronous requests via `window.fetch()`.
   - Validates `response.ok` and parses JSON arrays.
   - Implements in-memory caching to avoid redundant network calls.
   - Provides latency simulation (400ms delay) and error simulation for evaluator demonstration.

2. **`js/state.js` (Data Processing Engine)**
   - Maintains application state (`dataset`, `searchQuery`, `filterCategory`, `sortBy`, `sortOrder`, `currentPage`, `pageSize`).
   - Implements observer pattern via `subscribe()` to trigger UI updates on state mutation.
   - Executes multi-field text search and dynamic categorization.
   - Performs stable multi-field comparisons for dates, numbers, and strings.
   - Computes pagination slices and boundary indexes.

3. **`js/render.js` (Component Rendering Engine)**
   - Pure UI rendering functions with HTML escaping to prevent XSS.
   - `renderLoading()`: Generates animated skeleton cards and spinner.
   - `renderError()`: Displays actionable error cards with retry and diagnostic tips.
   - `renderEmpty()`: Displays friendly zero-results fallback with reset button.
   - `renderEvents()`, `renderStudents()`, `renderFaqs()`: Dataset-specific DOM templates.
   - `highlightText()`: Wraps search term matches in highlight tags.
   - `showModal()`: Accessible dialog popup presenting raw JSON formatting.

4. **`js/app.js` (Application Controller)**
   - Caches DOM references and binds event listeners.
   - Implements 250ms debouncing on the live search input.
   - Registers keyboard shortcut (<kbd>/</kbd>) to focus the search bar.
   - Manages light/dark mode with `localStorage` persistence.
   - Coordinates dataset tab switching and filter updates.

---

## 🚀 How to Run and Test Locally

Because the **Fetch API** (`fetch()`) adheres to browser Same-Origin Policy (CORS), opening via an HTTP server is recommended.

### Method 1: Using Python HTTP Server (Recommended)
Open a terminal in the practical directory and run:
```bash
cd practical_6_25cs-84
python -m http.server 8000
```
Then visit `http://localhost:8000` in any web browser.

### Method 2: Using Node.js `npx serve`
```bash
cd practical_6_25cs-84
npx -y serve .
```

### Method 3: Using VS Code / IDE Live Server
Right-click `index.html` in your editor and select **"Open with Live Server"**.

---

## 🧪 Evaluation Test Plan

1. **Dataset Tab Switching:**
   - Click **Campus Events**, **Student Directory**, and **Campus FAQs**.
   - Notice the loading skeleton briefly appear as `fetch()` asynchronously retrieves each JSON file.
2. **Search with Highlighting:**
   - Press <kbd>/</kbd> on your keyboard to instantly focus the search bar.
   - Type `"AI"`, `"React"`, or `"25CS084"`.
   - Observe real-time filtering with highlighted keyword badges.
3. **Multi-Field Filtering:**
   - Select a specific category (e.g., *Workshop* or *Computer Science & Engineering*).
   - Toggle status (e.g., *Upcoming* or *Honor Roll*).
4. **Sorting & Order Toggle:**
   - Change the Sort By dropdown (e.g., sort by *CGPA* or *Rating*).
   - Click the **▲ ASC / ▼ DESC** toggle button to reverse ordering.
5. **Pagination:**
   - Change items per page from 6 to 10 or 15.
   - Click **Next &rsaquo;**, page numbers, and **&laquo; First** to verify pagination navigation.
6. **Error & Loading Simulation:**
   - Click **"⚠️ Simulate Error"** in the top header; observe the error state card and test the **"Retry Fetch"** button.
   - Toggle **"⏳ Delay: 400ms"** to test loading skeletons.
7. **Theme Persistence:**
   - Click the Sun/Moon toggle button to switch between Dark and Light mode.
   - Refresh the page (<kbd>F5</kbd>) to confirm your theme is saved in `localStorage`.
