# Script to remove comments from code files
Write-Host "🧹 Starting comment cleanup process..." -ForegroundColor Cyan

# Define file extensions to process
$fileTypes = @(
    "*.js", "*.jsx", "*.ts", "*.tsx", "*.mjs",  # JavaScript/TypeScript
    "*.py",                                     # Python
    "*.css", "*.scss",                          # CSS/SCSS
    "*.html", "*.htm"                           # HTML
)

# Get all files recursively
$files = Get-ChildItem -Path . -Include $fileTypes -Recurse -File | 
         Where-Object { $_.FullName -notlike "*node_modules*" -and 
                       $_.FullName -notlike "*venv*" -and 
                       $_.FullName -notlike "*.next*" -and
                       $_.FullName -notlike "*__pycache__*" }

$totalFiles = $files.Count
$processedFiles = 0

Write-Host "Found $totalFiles files to process" -ForegroundColor Yellow

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Removing comments" -Status "Processing $($file.Name)" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    $extension = $file.Extension.ToLower()
    $content = Get-Content -Path $file.FullName -Raw
    $originalSize = $content.Length
    
    # Process based on file type
    switch -Wildcard ($extension) {
        ".js*" { 
            # JS/TS/JSX files - Remove single line and multi-line comments
            $content = $content -replace "//.*?$", "" -replace "/\*[\s\S]*?\*/", ""
        }
        ".ts*" { 
            # TS/TSX files - Remove single line and multi-line comments
            $content = $content -replace "//.*?$", "" -replace "/\*[\s\S]*?\*/", ""
        }
        ".mjs" { 
            # MJS files - Remove single line and multi-line comments
            $content = $content -replace "//.*?$", "" -replace "/\*[\s\S]*?\*/", ""
        }
        ".py" { 
            # Python files - Remove single line comments and docstrings
            $content = $content -replace "#.*?$", ""
            $content = $content -replace "'''[\s\S]*?'''", ""
            $content = $content -replace '"""[\s\S]*?"""', ""
        }
        ".css" { 
            # CSS files - Remove CSS comments
            $content = $content -replace "/\*[\s\S]*?\*/", ""
        }
        ".scss" { 
            # SCSS files - Remove CSS comments
            $content = $content -replace "/\*[\s\S]*?\*/", ""
            $content = $content -replace "//.*?$", ""
        }
        ".htm*" { 
            # HTML files - Remove HTML comments
            $content = $content -replace "<!--[\s\S]*?-->", ""
        }
    }
    
    # Remove empty lines and normalize whitespace
    $content = $content -replace "(?m)^\s*$\n", ""
    $content = $content -replace "(?m)(?<=\n)[ \t]+(?=\n)", ""
    
    # Calculate size reduction
    $newSize = $content.Length
    $reduction = $originalSize - $newSize
    $reductionPercentage = if ($originalSize -gt 0) { [math]::Round(($reduction / $originalSize) * 100, 1) } else { 0 }
    
    if ($reduction -gt 0) {
        Write-Host "Removed comments from $($file.Name) - Reduced by $reductionPercentage% ($reduction bytes)" -ForegroundColor Green
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "✨ Comment removal completed! Processed $totalFiles files." -ForegroundColor Cyan 