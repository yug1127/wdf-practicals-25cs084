# Lightweight Static Web Server for Practical 6 (Windows PowerShell)
$port = 8085
$folder = $PSScriptRoot
if (-not $folder) { $folder = Get-Location }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Server running at http://localhost:$port/"
    Write-Host "Press Ctrl+C to terminate."
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if (-not $urlPath) { $urlPath = "index.html" }
        
        $filePath = Join-Path $folder $urlPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                Default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("File Not Found")
            $response.OutputStream.Write($err, 0, $err.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
