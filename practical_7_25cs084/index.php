<?php
/**
 * Practical 7: PHP Form Processing, Validation, Sanitization & File Storage
 * Student: Yug Patel | Roll: 25CS084
 * Web Development Frameworks (WDF) - CHARUSAT
 */

// Enable strict typing & basic error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Directory paths for file storage
$dataDir = __DIR__ . '/data';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

$jsonFile = $dataDir . '/submissions.json';
$csvFile = $dataDir . '/submissions.csv';

// Pre-create CSV with headers if it doesn't exist
if (!file_exists($csvFile)) {
    $fp = fopen($csvFile, 'w');
    fputcsv($fp, ['Submission_ID', 'Timestamp', 'Full_Name', 'Email', 'Mobile', 'Department', 'Semester', 'Category', 'Message', 'IP_Address']);
    fclose($fp);
}

// Pre-create JSON array if it doesn't exist
if (!file_exists($jsonFile)) {
    file_put_contents($jsonFile, json_encode([], JSON_PRETTY_PRINT));
}

// Allowed options for dropdowns
$departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering'
];

$categories = [
    'Academic Registration',
    'Course Inquiry',
    'Workshop & Event Participation',
    'Exam Grievance',
    'General Feedback'
];

// Initialize form variables and error tracking
$name = '';
$email = '';
$mobile = '';
$department = '';
$semester = '';
$category = '';
$message = '';
$agree = false;

$errors = [];
$successMessage = '';
$submissionId = '';

/**
 * Sanitization Helper Function
 * Strips whitespace, slashes, and converts special characters to HTML entities
 */
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Process POST Request
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {

    // 1. Sanitize Raw Inputs
    $raw_name       = $_POST['name'] ?? '';
    $raw_email      = $_POST['email'] ?? '';
    $raw_mobile     = $_POST['mobile'] ?? '';
    $raw_department = $_POST['department'] ?? '';
    $raw_semester   = $_POST['semester'] ?? '';
    $raw_category   = $_POST['category'] ?? '';
    $raw_message    = $_POST['message'] ?? '';
    $raw_agree      = isset($_POST['agree']);

    $name       = sanitize_input($raw_name);
    $email      = filter_var(trim($raw_email), FILTER_SANITIZE_EMAIL);
    $mobile     = sanitize_input($raw_mobile);
    $department = sanitize_input($raw_department);
    $semester   = sanitize_input($raw_semester);
    $category   = sanitize_input($raw_category);
    $message    = sanitize_input($raw_message);
    $agree      = $raw_agree;

    // 2. Validate Full Name
    if (empty($name)) {
        $errors['name'] = 'Full Name is required.';
    } elseif (!preg_match("/^[a-zA-Z\s]{3,50}$/", $name)) {
        $errors['name'] = 'Full Name must be 3-50 characters long and contain only letters and spaces.';
    }

    // 3. Validate Email Address
    if (empty($email)) {
        $errors['email'] = 'Email address is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Please enter a valid email address (e.g., student@charusat.edu.in).';
    }

    // 4. Validate Mobile Number
    if (empty($mobile)) {
        $errors['mobile'] = 'Mobile number is required.';
    } elseif (!preg_match("/^[0-9]{10}$/", $mobile)) {
        $errors['mobile'] = 'Mobile number must consist of exactly 10 digits.';
    }

    // 5. Validate Department
    if (empty($department) || !in_array($department, $departments, true)) {
        $errors['department'] = 'Please select a valid engineering department.';
    }

    // 6. Validate Semester
    $semNum = intval($semester);
    if (empty($semester) || $semNum < 1 || $semNum > 8) {
        $errors['semester'] = 'Please select a valid semester between 1 and 8.';
    }

    // 7. Validate Inquiry Category
    if (empty($category) || !in_array($category, $categories, true)) {
        $errors['category'] = 'Please select a valid category.';
    }

    // 8. Validate Message / Comments
    if (empty($message)) {
        $errors['message'] = 'Message / remarks are required.';
    } elseif (mb_strlen($message) < 10) {
        $errors['message'] = 'Message must be at least 10 characters long.';
    } elseif (mb_strlen($message) > 500) {
        $errors['message'] = 'Message cannot exceed 500 characters.';
    }

    // 9. Validate Agreement Checkbox
    if (!$agree) {
        $errors['agree'] = 'You must confirm that all provided details are true and accurate.';
    }

    // 10. File Storage if Validation Passed
    if (empty($errors)) {
        $submissionId = 'REG-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $timestamp = date('Y-m-d H:i:s');
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        $record = [
            'id' => $submissionId,
            'timestamp' => $timestamp,
            'name' => $name,
            'email' => $email,
            'mobile' => $mobile,
            'department' => $department,
            'semester' => $semNum,
            'category' => $category,
            'message' => $message,
            'ip' => $ipAddress
        ];

        // A. Store in JSON File
        $existingJson = [];
        if (file_exists($jsonFile)) {
            $jsonContent = file_get_contents($jsonFile);
            $decoded = json_decode($jsonContent, true);
            if (is_array($decoded)) {
                $existingJson = $decoded;
            }
        }
        array_unshift($existingJson, $record); // Prepend new record to top
        file_put_contents($jsonFile, json_encode($existingJson, JSON_PRETTY_PRINT));

        // B. Store in CSV File
        $csvFp = fopen($csvFile, 'a');
        if ($csvFp) {
            fputcsv($csvFp, [
                $record['id'],
                $record['timestamp'],
                $record['name'],
                $record['email'],
                $record['mobile'],
                $record['department'],
                $record['semester'],
                $record['category'],
                str_replace(["\r", "\n"], ' ', $record['message']),
                $record['ip']
            ]);
            fclose($csvFp);
        }

        $successMessage = "Registration submitted successfully! Your tracking ID is <strong>{$submissionId}</strong>. Data has been safely written to JSON and CSV storage.";

        // Clear input values after successful save
        $name = '';
        $email = '';
        $mobile = '';
        $department = '';
        $semester = '';
        $category = '';
        $message = '';
        $agree = false;
    }
}

// Fetch stored records to display in recent submissions section
$storedRecords = [];
if (file_exists($jsonFile)) {
    $content = file_get_contents($jsonFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $storedRecords = $decoded;
    }
}
$totalSubmissions = count($storedRecords);
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="PHP Form, POST Method, Server-Side Validation, Sanitization, and File Storage. WDF Practical 7 by Yug Patel (25CS084).">
    <title>Practical 7: PHP Form, Validation, Sanitization & File Storage | 25CS084</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Header -->
    <header class="app-header">
        <div class="header-container">
            <div class="brand-group">
                <div class="brand-logo" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <div class="brand-text">
                    <h1 class="brand-title">Student Registration Portal</h1>
                    <p class="brand-subtitle">WDF Practical 7 &bull; PHP Form, POST, Validation & File Storage</p>
                </div>
            </div>

            <div class="header-actions">
                <div class="student-chip">
                    <span class="chip-avatar">YP</span>
                    <div class="chip-info">
                        <span class="chip-name">Yug Patel</span>
                        <span class="chip-roll">Roll No: 25CS084</span>
                    </div>
                </div>

                <button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle theme">
                    <svg id="themeIcon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="main-wrapper">

        <!-- Top Alerts (Success / Error Banners) -->
        <?php if (!empty($successMessage)): ?>
            <div class="alert alert-success" role="alert">
                <div class="alert-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <div class="alert-content">
                    <h3 class="alert-title">Submission Succeeded!</h3>
                    <p><?php echo $successMessage; ?></p>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($errors)): ?>
            <div class="alert alert-error" role="alert">
                <div class="alert-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="alert-content">
                    <h3 class="alert-title">Validation Errors Encountered (<?php echo count($errors); ?>)</h3>
                    <p>Please resolve the invalid fields highlighted in red below and resubmit.</p>
                </div>
            </div>
        <?php endif; ?>

        <!-- Two Column Layout: Form + Stored Records Log -->
        <div class="portal-grid">

            <!-- Left Column: The PHP Form -->
            <section class="card form-card">
                <div class="card-header">
                    <h2>Student Registration &amp; Query Form</h2>
                    <p class="card-subtitle">Method: <code>POST</code> &bull; Server-Side PHP Validation &amp; Sanitization</p>
                </div>

                <!-- Form submitting via POST method -->
                <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF'] ?? 'index.php'); ?>" method="POST" novalidate class="php-form">

                    <!-- Full Name -->
                    <div class="form-group <?php echo isset($errors['name']) ? 'has-error' : ''; ?>">
                        <label for="name" class="form-label">
                            Full Name <span class="required">*</span>
                        </label>
                        <div class="input-wrap">
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                class="form-input" 
                                placeholder="Enter student full name (e.g. Yug Patel)" 
                                value="<?php echo htmlspecialchars($name); ?>"
                                required
                            >
                        </div>
                        <?php if (isset($errors['name'])): ?>
                            <span class="error-msg"><?php echo htmlspecialchars($errors['name']); ?></span>
                        <?php endif; ?>
                    </div>

                    <!-- Email & Mobile row -->
                    <div class="form-row">
                        <!-- Email -->
                        <div class="form-group <?php echo isset($errors['email']) ? 'has-error' : ''; ?>">
                            <label for="email" class="form-label">
                                Email Address <span class="required">*</span>
                            </label>
                            <div class="input-wrap">
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    class="form-input" 
                                    placeholder="student@charusat.edu.in" 
                                    value="<?php echo htmlspecialchars($email); ?>"
                                    required
                                >
                            </div>
                            <?php if (isset($errors['email'])): ?>
                                <span class="error-msg"><?php echo htmlspecialchars($errors['email']); ?></span>
                            <?php endif; ?>
                        </div>

                        <!-- Mobile -->
                        <div class="form-group <?php echo isset($errors['mobile']) ? 'has-error' : ''; ?>">
                            <label for="mobile" class="form-label">
                                Mobile Number <span class="required">*</span>
                            </label>
                            <div class="input-wrap">
                                <input 
                                    type="tel" 
                                    id="mobile" 
                                    name="mobile" 
                                    class="form-input" 
                                    placeholder="10 digit mobile number" 
                                    value="<?php echo htmlspecialchars($mobile); ?>"
                                    maxlength="10"
                                    required
                                >
                            </div>
                            <?php if (isset($errors['mobile'])): ?>
                                <span class="error-msg"><?php echo htmlspecialchars($errors['mobile']); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Department & Semester row -->
                    <div class="form-row">
                        <!-- Department -->
                        <div class="form-group <?php echo isset($errors['department']) ? 'has-error' : ''; ?>">
                            <label for="department" class="form-label">
                                Department / Branch <span class="required">*</span>
                            </label>
                            <div class="input-wrap">
                                <select id="department" name="department" class="form-select" required>
                                    <option value="">-- Choose Department --</option>
                                    <?php foreach ($departments as $dept): ?>
                                        <option value="<?php echo htmlspecialchars($dept); ?>" <?php echo ($department === $dept) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($dept); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <?php if (isset($errors['department'])): ?>
                                <span class="error-msg"><?php echo htmlspecialchars($errors['department']); ?></span>
                            <?php endif; ?>
                        </div>

                        <!-- Semester -->
                        <div class="form-group <?php echo isset($errors['semester']) ? 'has-error' : ''; ?>">
                            <label for="semester" class="form-label">
                                Current Semester <span class="required">*</span>
                            </label>
                            <div class="input-wrap">
                                <select id="semester" name="semester" class="form-select" required>
                                    <option value="">-- Choose Semester --</option>
                                    <?php for ($s = 1; $s <= 8; $s++): ?>
                                        <option value="<?php echo $s; ?>" <?php echo ($semester == $s) ? 'selected' : ''; ?>>
                                            Semester <?php echo $s; ?>
                                        </option>
                                    <?php endfor; ?>
                                </select>
                            </div>
                            <?php if (isset($errors['semester'])): ?>
                                <span class="error-msg"><?php echo htmlspecialchars($errors['semester']); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Inquiry Category -->
                    <div class="form-group <?php echo isset($errors['category']) ? 'has-error' : ''; ?>">
                        <label for="category" class="form-label">
                            Purpose / Category <span class="required">*</span>
                        </label>
                        <div class="input-wrap">
                            <select id="category" name="category" class="form-select" required>
                                <option value="">-- Select Purpose --</option>
                                <?php foreach ($categories as $cat): ?>
                                    <option value="<?php echo htmlspecialchars($cat); ?>" <?php echo ($category === $cat) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($cat); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <?php if (isset($errors['category'])): ?>
                            <span class="error-msg"><?php echo htmlspecialchars($errors['category']); ?></span>
                        <?php endif; ?>
                    </div>

                    <!-- Message / Remarks -->
                    <div class="form-group <?php echo isset($errors['message']) ? 'has-error' : ''; ?>">
                        <label for="message" class="form-label">
                            Remarks / Message <span class="required">*</span>
                        </label>
                        <div class="input-wrap">
                            <textarea 
                                id="message" 
                                name="message" 
                                rows="3" 
                                class="form-textarea" 
                                placeholder="Enter detailed query or student registration remarks (minimum 10 characters)..."
                                required
                            ><?php echo htmlspecialchars($message); ?></textarea>
                        </div>
                        <?php if (isset($errors['message'])): ?>
                            <span class="error-msg"><?php echo htmlspecialchars($errors['message']); ?></span>
                        <?php endif; ?>
                    </div>

                    <!-- Agreement Checkbox -->
                    <div class="form-group checkbox-group <?php echo isset($errors['agree']) ? 'has-error' : ''; ?>">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                name="agree" 
                                value="1" 
                                <?php echo $agree ? 'checked' : ''; ?>
                            >
                            <span>I certify that all details submitted above are accurate and can be stored in the file registry.</span>
                        </label>
                        <?php if (isset($errors['agree'])): ?>
                            <span class="error-msg"><?php echo htmlspecialchars($errors['agree']); ?></span>
                        <?php endif; ?>
                    </div>

                    <!-- Action Buttons -->
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                            Submit via POST
                        </button>
                        <a href="<?php echo htmlspecialchars($_SERVER['PHP_SELF'] ?? 'index.php'); ?>" class="btn btn-secondary">
                            Reset Form
                        </a>
                    </div>

                </form>
            </section>

            <!-- Right Column: Stored Submissions & File Info -->
            <aside class="records-column">

                <!-- File Storage Registry Card -->
                <div class="card storage-info-card">
                    <div class="card-header">
                        <h3>File Storage Registry</h3>
                        <span class="badge badge-success"><?php echo $totalSubmissions; ?> Saved Records</span>
                    </div>
                    <p class="card-desc">
                        Every valid POST submission is parsed, sanitized, and stored into both <strong>JSON</strong> and <strong>CSV</strong> flat files on the server:
                    </p>

                    <div class="file-links-list">
                        <div class="file-link-item">
                            <div class="file-icon json-icon">JSON</div>
                            <div class="file-details">
                                <strong>submissions.json</strong>
                                <span>Structured JSON object array</span>
                            </div>
                            <a href="data/submissions.json" download class="btn-download" title="Download raw JSON">
                                ⬇ Download
                            </a>
                        </div>

                        <div class="file-link-item">
                            <div class="file-icon csv-icon">CSV</div>
                            <div class="file-details">
                                <strong>submissions.csv</strong>
                                <span>Comma-separated spreadsheet format</span>
                            </div>
                            <a href="data/submissions.csv" download class="btn-download" title="Download raw CSV">
                                ⬇ Download
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Recent Submissions Table Card -->
                <div class="card recent-table-card">
                    <div class="card-header">
                        <h3>Recent Submissions</h3>
                    </div>

                    <?php if (empty($storedRecords)): ?>
                        <div class="empty-state">
                            <p>No records stored yet. Fill the form to add the first registration entry!</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="records-table">
                                <thead>
                                    <tr>
                                        <th>ID &amp; Name</th>
                                        <th>Department &amp; Sem</th>
                                        <th>Category</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach (array_slice($storedRecords, 0, 6) as $rec): ?>
                                        <tr>
                                            <td>
                                                <div class="rec-name">
                                                    <strong><?php echo htmlspecialchars($rec['name']); ?></strong>
                                                    <span class="rec-id"><?php echo htmlspecialchars($rec['id']); ?></span>
                                                </div>
                                                <small class="rec-email"><?php echo htmlspecialchars($rec['email']); ?></small>
                                            </td>
                                            <td>
                                                <div class="rec-dept"><?php echo htmlspecialchars($rec['department']); ?></div>
                                                <span class="badge badge-sem">Sem <?php echo htmlspecialchars($rec['semester']); ?></span>
                                            </td>
                                            <td>
                                                <span class="badge badge-cat"><?php echo htmlspecialchars($rec['category']); ?></span>
                                            </td>
                                            <td class="rec-time">
                                                <?php echo htmlspecialchars(substr($rec['timestamp'], 11, 8)); ?>
                                                <br>
                                                <small><?php echo htmlspecialchars(substr($rec['timestamp'], 0, 10)); ?></small>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>

            </aside>

        </div>

    </main>

    <!-- Footer -->
    <footer class="app-footer">
        <div class="footer-container">
            <div class="footer-left">
                <p><strong>Web Development Frameworks (WDF) - Practical 7</strong></p>
                <p>Charotar University of Science and Technology (CHARUSAT)</p>
            </div>
            <div class="footer-center">
                <span class="badge-student">Student: Yug Patel | Roll: 25CS084</span>
            </div>
            <div class="footer-right">
                <p>PHP Form &bull; POST Method &bull; Validation &bull; Sanitization &bull; JSON &amp; CSV Storage</p>
            </div>
        </div>
    </footer>

    <!-- Theme Switcher Script -->
    <script>
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const themeIcon = document.getElementById('themeIcon');
        const currentTheme = localStorage.getItem('wdf_theme_25cs084') || 'light';
        applyTheme(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            const active = document.documentElement.getAttribute('data-theme') || 'light';
            const next = active === 'light' ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem('wdf_theme_25cs084', next);
        });

        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'dark') {
                themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            } else {
                themeIcon.innerHTML = `
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
    </script>
</body>
</html>
