# NBR Assist — Deploy to Vercel + Neon
# Run from project root: powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "`n=== NBR Assist Deployment ===" -ForegroundColor Cyan

Write-Host @"

STEP 1 — Create Neon database (2 min)
  1. Go to https://console.neon.tech
  2. New Project -> name: nbr-assist
  3. Copy the connection string (use pooled connection)

"@ -ForegroundColor Yellow

$databaseUrl = Read-Host "Paste Neon DATABASE_URL"
$geminiKey = Read-Host "Paste GEMINI_API_KEY"

$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)

Write-Host "`n--- GitHub push ---" -ForegroundColor Yellow
git add package.json package-lock.json prisma src docs scripts docker-compose.yml README.md .gitignore .env.example tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs public
git commit -m "Add NBR Assist - AI compliance copilot"
$hasRemote = git remote 2>$null
if (-not $hasRemote) {
    gh repo create nbr-assist --public --source=. --remote=origin --push
} else {
    git push -u origin master
}

Write-Host "`n--- Vercel deploy ---" -ForegroundColor Yellow
Write-Host "Import at: https://vercel.com/new (select NazmusSakib3/nbr-assist)"
Write-Host "Add these environment variables in Vercel dashboard:"
Write-Host "  DATABASE_URL = $databaseUrl"
Write-Host "  JWT_SECRET = $jwtSecret"
Write-Host "  GEMINI_API_KEY = (your key)"
Write-Host "  GEMINI_CHAT_MODEL = gemini-3.5-flash-lite"
Write-Host "  GEMINI_EMBED_MODEL = gemini-embedding-001"
Write-Host "  NEXT_PUBLIC_APP_URL = https://YOUR-APP.vercel.app"

$seed = Read-Host "`nSeed production DB now? (y/n)"
if ($seed -eq "y") {
    $env:DATABASE_URL = $databaseUrl
    $env:GEMINI_API_KEY = $geminiKey
    npm run db:seed
    Write-Host "Database seeded!" -ForegroundColor Green
}

Write-Host "`nDemo login: admin@nbrassist.local / Admin123!" -ForegroundColor Green
