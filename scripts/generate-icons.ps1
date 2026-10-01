Add-Type -AssemblyName System.Drawing

$srcPath = "d:\mon-track\public\icons\montrack-logo.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source file not found: $srcPath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($srcPath)

function Resize-And-Save($source, $width, $height, $targetPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($source, 0, 0, $width, $height)
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $targetPath ($width x $height PNG)"
}

Resize-And-Save $img 192 192 "d:\mon-track\public\icons\icon-192.png"
Resize-And-Save $img 512 512 "d:\mon-track\public\icons\icon-512.png"
Resize-And-Save $img 180 180 "d:\mon-track\public\icons\apple-touch-icon.png"
Resize-And-Save $img 512 512 "d:\mon-track\public\icons\logo-baru.png"
Resize-And-Save $img 192 192 "d:\mon-track\src\app\icon.png"
Resize-And-Save $img 180 180 "d:\mon-track\src\app\apple-icon.png"

$img.Dispose()
Write-Host "All icons generated successfully!"
