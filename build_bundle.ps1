# Script build bundle.js tu cac modules don le trong js/
$outputFile = "c:\Users\pc\.gemini\antigravity\scratch\dctHanyu\js\bundle.js"

$files = @(
    "js\utils\accountManager.js",
    "js\data\dictionaryData.js",
    "js\data\hskTopicsData.js",
    "js\data\musicData.js",
    "js\utils\pinyinUtils.js",
    "js\utils\speech.js",
    "js\utils\srs.js",
    "js\utils\hanziCanvas.js",
    "js\views\authModal.js",
    "js\views\homeDashboardView.js",
    "js\views\topicsView.js",
    "js\views\practiceView.js",
    "js\views\dictionaryView.js",
    "js\views\chatgptView.js",
    "js\views\musicView.js",
    "js\views\scheduleView.js",
    "js\views\gameView.js",
    "js\views\grammarView.js",
    "js\views\readingView.js",
    "js\views\adminUsersView.js",
    "js\views\userProfileModal.js",
    "js\app.js"
)

$bundleCode = [System.Text.StringBuilder]::new()
[void]$bundleCode.AppendLine("/* ==========================================================================")
[void]$bundleCode.AppendLine("   Hanzo - Standalone Bundle Script")
[void]$bundleCode.AppendLine("   Generated at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$bundleCode.AppendLine("   ========================================================================== */")
[void]$bundleCode.AppendLine("")
[void]$bundleCode.AppendLine("(function () {")
[void]$bundleCode.AppendLine("  'use strict';")
[void]$bundleCode.AppendLine("")

foreach ($file in $files) {
    $fullPath = Join-Path "c:\Users\pc\.gemini\antigravity\scratch\dctHanyu" $file
    if (Test-Path $fullPath) {
        [void]$bundleCode.AppendLine("  // --------------------------------------------------------------------------")
        [void]$bundleCode.AppendLine("  // MODULE: $file")
        [void]$bundleCode.AppendLine("  // --------------------------------------------------------------------------")
        
        $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
        $lines = $content -split "`r?\n"
        
        $inImportBlock = $false
        foreach ($line in $lines) {
            # If inside multi-line import block
            if ($inImportBlock) {
                # Check if this line ends the import block
                if ($line -match "from\s+['""]") {
                    $inImportBlock = $false
                }
                continue
            }
            
            # Check if this line starts an import
            if ($line -match "^\s*import\b") {
                # If it doesn't contain 'from', it's a multi-line import
                if ($line -notmatch "from\s+['""]") {
                    $inImportBlock = $true
                }
                continue
            }
            
            # Skip stray '} from ...' lines
            if ($line -match "^\s*\}\s*from\s+['""]") {
                continue
            }
            
            $cleanLine = $line
            if ($cleanLine -match "^\s*export\s+async\s+function\s+") {
                $cleanLine = $cleanLine -replace "^\s*export\s+async\s+function\s+", "async function "
            } elseif ($cleanLine -match "^\s*export\s+function\s+") {
                $cleanLine = $cleanLine -replace "^\s*export\s+function\s+", "function "
            } elseif ($cleanLine -match "^\s*export\s+class\s+") {
                $cleanLine = $cleanLine -replace "^\s*export\s+class\s+", "class "
            } elseif ($cleanLine -match "^\s*export\s+const\s+") {
                $cleanLine = $cleanLine -replace "^\s*export\s+const\s+", "const "
            } elseif ($cleanLine -match "^\s*export\s+let\s+") {
                $cleanLine = $cleanLine -replace "^\s*export\s+let\s+", "let "
            } elseif ($cleanLine -match "^\s*export\s+default\s+") {
                $cleanLine = $cleanLine -replace "^\s*export\s+default\s+", ""
            } elseif ($cleanLine -match "^\s*export\s+\{") {
                continue
            }
            
            [void]$bundleCode.AppendLine($cleanLine)
        }
        [void]$bundleCode.AppendLine("")
    } else {
        Write-Host "Warning: File not found: $fullPath"
    }
}

[void]$bundleCode.AppendLine("})();")

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputFile, $bundleCode.ToString(), $utf8NoBom)
Write-Host "Successfully generated bundle.js at $outputFile"
