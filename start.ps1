# ============================================
#  CzechServices — Запуск всіх сервісів
# ============================================

$root = $PSScriptRoot

Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      CzechServices Platform          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# --- 1. Backend (NestJS) ---
Write-Host "▶ Запуск Backend (NestJS) на порту 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$root\packages\backend'; Write-Host '=== BACKEND ===' -ForegroundColor Yellow; pnpm start:dev"
)

Write-Host "  ⏳ Чекаємо 8 секунд поки бекенд стартує..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# --- 2. Frontend (Next.js) ---
Write-Host "▶ Запуск Frontend (Next.js) на порту 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$root\packages\frontend'; Write-Host '=== FRONTEND ===' -ForegroundColor Green; pnpm dev --port 3001 --hostname 127.0.0.1"
)

Write-Host ""
Write-Host "✅ Всі сервіси запущені!" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Сайт:  http://127.0.0.1:3001" -ForegroundColor Cyan
Write-Host "  ⚙️  API:   http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Тестовий акаунт:" -ForegroundColor Gray
Write-Host "  📧 katerina@example.com" -ForegroundColor White
Write-Host "  🔑 Password123!" -ForegroundColor White
Write-Host ""
