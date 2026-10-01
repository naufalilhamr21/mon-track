Add-Type -AssemblyName System.Drawing

$webSrcPath = "d:\mon-track\public\icons\moneta-web-icon.jpg"
$mobileSrcPath = "d:\mon-track\public\icons\moneta-logo.jpg"

if (-not (Test-Path $webSrcPath)) {
    Write-Error "Web icon source file not found: $webSrcPath"
    exit 1
}
if (-not (Test-Path $mobileSrcPath)) {
    Write-Error "Mobile logo source file not found: $mobileSrcPath"
    exit 1
}

$webImg = [System.Drawing.Image]::FromFile($webSrcPath)
$mobileImg = [System.Drawing.Image]::FromFile($mobileSrcPath)

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

# 1. Web browser icons (Favicon & web tab icon) from moneta-web-icon.jpg
Resize-And-Save $webImg 48 48 "d:\mon-track\public\favicon.ico"
Resize-And-Save $webImg 48 48 "d:\mon-track\src\app\favicon.ico"
Resize-And-Save $webImg 192 192 "d:\mon-track\src\app\icon.png"
Resize-And-Save $webImg 192 192 "d:\mon-track\public\icons\web-icon-192.png"
Resize-And-Save $webImg 512 512 "d:\mon-track\public\icons\web-icon-512.png"

# 2. Mobile App PWA & Apple Touch icons from moneta-logo.jpg
Resize-And-Save $mobileImg 192 192 "d:\mon-track\public\icons\icon-192.png"
Resize-And-Save $mobileImg 512 512 "d:\mon-track\public\icons\icon-512.png"
Resize-And-Save $mobileImg 180 180 "d:\mon-track\public\icons\apple-touch-icon.png"
Resize-And-Save $mobileImg 180 180 "d:\mon-track\src\app\apple-icon.png"
Resize-And-Save $mobileImg 512 512 "d:\mon-track\public\icons\logo-baru.png"

$webImg.Dispose()
$mobileImg.Dispose()
Write-Host "All icons (web and mobile app) generated successfully!"

