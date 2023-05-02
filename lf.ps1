$files = git ls-files

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $content = $content -replace "`r`n", "`n"
    Set-Content -NoNewline -Path $file -Value $content
}

git add -A
git commit -m "Converted line endings from CRLF to LF"
