# Start PHP Built-in Web Server for Practical 7 (Using XAMPP PHP)
$port = 8080
$phpPath = "C:\xampp\php\php.exe"

if (-not (Test-Path $phpPath)) {
    # Check if php is in system PATH as fallback
    $cmd = Get-Command php -ErrorAction SilentlyContinue
    if ($cmd) {
        $phpPath = "php"
    } else {
        Write-Error "PHP executable not found at $phpPath. Please ensure XAMPP is installed."
        exit 1
    }
}

Write-Host "Starting PHP Development Server for Practical 7..."
Write-Host "URL: http://localhost:$port"
Write-Host "Document Root: $PSScriptRoot"
Write-Host "Press Ctrl+C to stop the server."

& $phpPath -S "localhost:$port" -t $PSScriptRoot
