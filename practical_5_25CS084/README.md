# Practical 5: Student Registration Form & JavaScript Client-Side Validation

- **Course:** Web Development Frameworks (WDF)
- **Student Name:** Yug Patel
- **Roll Number:** 25CS084
- **Directory:** `practical_5_25CS084`
- **Submission Date:** October 2026

---

## 🎯 Practical Objectives & Features

This practical implements a student registration form with client-side validation using vanilla JavaScript, modern CSS styling, and HTML5 semantics.

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Full Name Validation** | Requires minimum 3 characters, letters and spaces only (`/^[A-Za-z ]{3,50}$/`). | ✅ Complete |
| **Email Validation** | Standard regex checking format `username@domain.extension`. | ✅ Complete |
| **Mobile Number Validation** | Exactly 10 numeric digits (`/^[0-9]{10}$/`). | ✅ Complete |
| **Password Complexity** | Minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol. | ✅ Complete |
| **Password Strength Meter** | Dynamic strength calculation (Weak: 33%, Medium: 66%, Strong: 100%) with animated progress bar and live indicator. | ✅ Complete |
| **Password Confirmation** | Real-time check verifying matching confirmation password with clear error feedback. | ✅ Complete |
| **Dropdown & Radio Fields** | Mandatory Course selection, Year selection, and Gender radio buttons. | ✅ Complete |
| **Terms & Conditions Check** | Enforced checkbox confirmation before submission. | ✅ Complete |
| **Error Handling & Focus** | Dedicated `.error` elements per field, dynamic `.input-error` / `.input-valid` borders, and auto-focusing on the first invalid field. | ✅ Complete |
| **Form Reset Handling** | Complete reset handler clearing values, validation borders, error text, and password strength bar. | ✅ Complete |

---

## 📂 File Structure

```text
practical_5_25CS084/
├── index.html       # Student Registration Form structure with semantic elements and accessibility attributes
├── style.css        # Responsive styling, input state borders, strength meter, and layout
├── script.js        # Form validation logic, regular expressions, password strength meter, and event listeners
└── README.md        # Documentation and evaluation summary
```

---

## 🧪 Testing Instructions

1. Open `index.html` in any modern web browser.
2. Click **Register Student** with empty fields to observe validation messages and auto-focus on the first invalid input.
3. Type in the **Password** field to see the password strength progress bar and text update in real time.
4. Fill in valid inputs across all fields, check the terms agreement, and click **Register Student** to view the green success banner.
5. Click **Reset Form** to verify that all inputs, errors, and strength indicators are cleanly reset.
