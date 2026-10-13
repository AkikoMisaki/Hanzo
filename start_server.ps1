# Script khoi chay Local HTTP Server cho Hanzo Hanyu (http://localhost:8088)
$port = 8088
$url = "http://localhost:$port/"
$workspace = "c:\Users\pc\.gemini\antigravity\scratch\dctHanyu"

Write-Host "==================================================================" -ForegroundColor Red
Write-Host "   HANZO HANYU - LOCAL HTTP SERVER (http://localhost:$port/)     " -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Red
Write-Host "[+] Server local ngầm đang chạy tại địa chỉ: $url" -ForegroundColor Green
Write-Host "[+] Mở ứng dụng qua Localhost giúp Chrome/Edge LƯU VĨNH VIỄN quyền Micro!" -ForegroundColor Cyan
Write-Host "[+] Cửa sổ hỏi cấp quyền SẼ TẮT VĨNH VIỄN từ lần bấm Allow đầu tiên." -ForegroundColor White
Write-Host "=================================================================="

# Mo trinh duyet tu dong sang URL http://localhost:8080/index.html
Start-Process $url

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.Url.LocalPath.TrimStart('/')
        if ($relPath -eq '' -or $relPath -eq '/') { $relPath = 'index.html' }
        $localPath = Join-Path $workspace $relPath

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }
            # No-cache headers cho JS, CSS, HTML de tranh browser cache cu
            if ($ext -in @(".js", ".css", ".html")) {
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
                $response.Headers.Add("Pragma", "no-cache")
                $response.Headers.Add("Expires", "0")
            }
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
