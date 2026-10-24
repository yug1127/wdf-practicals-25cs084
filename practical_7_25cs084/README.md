# Practical 7: PHP Form Processing, Validation, Sanitization & File Storage

- **Course:** Web Development Frameworks (WDF)
- **Student Name:** Yug Patel
- **Roll Number:** 25CS084
- **Directory:** `practical_7_25cs084`
- **Submission Date:** October 2026

---

## 🎯 Problem Statement & Objectives

Develop a comprehensive server-side PHP web application that presents a student registration and query form submitted via the HTTP `POST` method. The backend must enforce server-side sanitization and validation on all inputs, provide clear success and error feedback banners, and persist valid submissions directly into flat files (`JSON` and `CSV`).

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **PHP Form** | Complete responsive registration and inquiry form collecting Full Name, Email, Mobile, Department, Semester, Category, Remarks, and Agreement. | ✅ Complete |
| **POST Method** | Submits via `method="POST"` to `action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>"` preventing URL query string exposure. | ✅ Complete |
| **Validation** | Rigorous server-side verification: checks empty fields, regex validation for Name (`/^[a-zA-Z\s]{3,50}$/`), 10-digit Mobile (`/^[0-9]{10}$/`), `FILTER_VALIDATE_EMAIL`, dropdown bounds, and checkbox confirmation. | ✅ Complete |
| **Sanitization** | Input sanitization using custom `sanitize_input()` (`trim()`, `stripslashes()`, `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`) and `FILTER_SANITIZE_EMAIL` to prevent XSS and injection vulnerabilities. | ✅ Complete |
| **File Storage** | Persists submissions into both **`data/submissions.json`** (structured object array) and **`data/submissions.csv`** (using `fputcsv()`). Includes live viewer table and 1-click download links. | ✅ Complete |
| **Success Message** | Prominent green alert banner displaying confirmation and a unique tracking ID (`REG-YYYYMMDD-XXXX`). Input fields are safely cleared after success. | ✅ Complete |
| **Error Messages** | Top summary alert showing error count along with contextual red inline error messages and border highlights under each invalid field. Prior valid inputs are preserved. | ✅ Complete |

---

## 📂 File Architecture

```text
practical_7_25cs084/
├── index.php             # Main PHP script: handles GET rendering, POST processing, validation & UI
├── style.css             # Glassmorphism design system, validation error borders, dark/light theme
├── server.ps1            # 1-click launcher for PHP built-in server using XAMPP PHP
├── data/
│   ├── submissions.json  # Auto-generated JSON storage holding record entries
│   └── submissions.csv   # Auto-generated CSV spreadsheet storage holding record entries
└── README.md             # Documentation, security overview, and local execution guide
```

---

## 🛡️ Input Validation & Sanitization Schema

```php
// Sanitization helper
function sanitize_input($data) {
    if (is_array($data)) return array_map('sanitize_input', $data);
    $data = trim($data);
    $data = stripslashes($data);
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}
```

| Field | Type | Validation Rules | Sanitization Applied |
| :--- | :--- | :--- | :--- |
| **Full Name** | Text | Required, 3–50 chars, alphabets & spaces only (`/^[a-zA-Z\s]{3,50}$/`) | `trim()`, `stripslashes()`, `htmlspecialchars()` |
| **Email** | Email | Required, valid RFC format checked with `FILTER_VALIDATE_EMAIL` | `filter_var(..., FILTER_SANITIZE_EMAIL)` |
| **Mobile** | Tel | Required, exactly 10 numeric digits (`/^[0-9]{10}$/`) | `trim()`, `htmlspecialchars()` |
| **Department** | Select | Required, must strictly match allowed engineering branches | `in_array(..., $departments, true)` |
| **Semester** | Select | Required, integer range 1 to 8 | `intval()` range check |
| **Category** | Select | Required, must match allowed inquiry purposes | `in_array(..., $categories, true)` |
| **Message** | Textarea | Required, min 10 to max 500 characters | `trim()`, `stripslashes()`, `htmlspecialchars()` |
| **Agreement** | Checkbox | Required, must be checked (`isset($_POST['agree'])`) | Boolean assertion |

---

## 🚀 How to Run Locally

### Option A: Using the Included PowerShell Script (Fastest)
Run the included launcher (which automatically detects XAMPP's PHP):
```powershell
cd practical_7_25cs084
powershell -ExecutionPolicy Bypass -File server.ps1
```
Open **`http://localhost:8080`** in your browser.

### Option B: Using XAMPP Apache
1. Copy or move `practical_7_25cs084` to your XAMPP `htdocs` directory (e.g. `C:\xampp\htdocs\practical_7_25cs084`).
2. Start the **Apache** module from the XAMPP Control Panel.
3. Open **`http://localhost/practical_7_25cs084/`** in your browser.

---

## 🧪 Testing Verification

1. **Test Empty Submission:** Click **"Submit via POST"** with blank inputs. Observe red error borders and feedback messages under each field.
2. **Test Invalid Format:** Type numbers in the Name field or an invalid email (e.g., `user@test`). Observe specific validation errors.
3. **Test Successful Submission:** Fill all required fields with valid data, check the confirmation box, and click **"Submit via POST"**.
   - A green banner appears with a generated tracking ID (e.g., `#REG-20261024-XXXX`).
   - The submission is immediately appended to `data/submissions.json` and `data/submissions.csv`.
   - The recent submissions table on the right updates instantly to display the new entry.
4. **Test Downloads:** Click the **"⬇ Download"** buttons for JSON and CSV to inspect the persisted data files.
