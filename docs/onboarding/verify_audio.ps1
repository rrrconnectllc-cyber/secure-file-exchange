# Verify all audio files were generated correctly

$AudioDir = "C:\Users\Admin\secure-file-exchange\docs\onboarding\audio"
$ManifestPath = Join-Path $AudioDir "AUDIO_MANIFEST.json"

Write-Host "========== AUDIO FILE VERIFICATION ==========" -ForegroundColor Cyan
Write-Host "Directory: $AudioDir" -ForegroundColor Yellow

# Check if directory exists
if (-not (Test-Path $AudioDir)) {
    Write-Host "[ERROR] Audio directory not found!" -ForegroundColor Red
    exit 1
}

# Count MP3 files
$mp3Files = Get-ChildItem -Path $AudioDir -Filter "segment_*.mp3" -ErrorAction SilentlyContinue
$mp3Count = $mp3Files.Count

Write-Host "`nMP3 Files Found: $mp3Count" -ForegroundColor Green

# List all files with details
if ($mp3Count -gt 0) {
    Write-Host "`nFile Details:" -ForegroundColor Yellow
    $totalSize = 0
    foreach ($file in $mp3Files | Sort-Object Name) {
        $sizeKB = [math]::Round($file.Length / 1024, 2)
        $durationSec = [math]::Round($file.Length / 2000, 1)
        Write-Host "  $($file.Name): $sizeKB KB (~$durationSec sec)" -ForegroundColor Gray
        $totalSize += $file.Length
    }

    $totalSizeMB = [math]::Round($totalSize / 1024 / 1024, 2)
    $totalDurationMin = [math]::Round(($totalSize / 2000) / 60, 1)

    Write-Host "`nTotal Size: $totalSizeMB MB" -ForegroundColor Green
    Write-Host "Total Duration: ~$totalDurationMin minutes" -ForegroundColor Green
}

# Check manifest
if (Test-Path $ManifestPath) {
    Write-Host "`nManifest File: [OK]" -ForegroundColor Green
    $manifest = Get-Content $ManifestPath | ConvertFrom-Json
    Write-Host "  Segments in manifest: $($manifest.segments.Count)" -ForegroundColor Gray
    Write-Host "  Voice: $($manifest.voice)" -ForegroundColor Gray
    Write-Host "  Region: $($manifest.region)" -ForegroundColor Gray
} else {
    Write-Host "`nManifest File: [NOT FOUND]" -ForegroundColor Red
}

Write-Host "`nStatus:" -ForegroundColor Cyan
if ($mp3Count -eq 22) {
    Write-Host "[SUCCESS] All 22 audio files generated and ready!" -ForegroundColor Green
} elseif ($mp3Count -gt 0) {
    Write-Host "[PARTIAL] Generated $mp3Count of 22 files (incomplete)" -ForegroundColor Yellow
} else {
    Write-Host "[FAILED] No audio files found" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
