# Meilisearch index initialization script# Meilisearch インデックス初期化スクリプト

# Usage: .\scripts\init-meilisearch.ps1# 使用方法: .\scripts\init-meilisearch.ps1



$MEILI_URL = "http://localhost:7700"$MEILI_URL = "http://localhost:7700"

$MEILI_KEY = "masterKey123"$MEILI_KEY = "masterKey123"



$headers = @{$headers = @{

    Authorization = "Bearer $MEILI_KEY"    Authorization = "Bearer $MEILI_KEY"

}}



$indexes = @("assets", "games", "conversations")$indexes = @("assets", "games", "conversations")



Write-Host "Initializing Meilisearch indexes..." -ForegroundColor CyanWrite-Host "Meilisearch インデックスを初期化します..." -ForegroundColor Cyan

Write-Host "URL: $MEILI_URL" -ForegroundColor GrayWrite-Host "URL: $MEILI_URL" -ForegroundColor Gray

Write-Host ""Write-Host ""



foreach ($index in $indexes) {foreach ($index in $indexes) {

    try {    try {

        Write-Host "Creating index '$index'..." -NoNewline        Write-Host "インデックス '$index' を作成中..." -NoNewline

                

        $body = @{        $body = @{

            uid = $index            uid = $index

        } | ConvertTo-Json        } | ConvertTo-Json

                

        $null = Invoke-RestMethod `        $null = Invoke-RestMethod `

            -Uri "$MEILI_URL/indexes" `            -Uri "$MEILI_URL/indexes" `

            -Method Post `            -Method Post `

            -Headers $headers `            -Headers $headers `

            -ContentType "application/json" `            -ContentType "application/json" `

            -Body $body            -Body $body

                

        Write-Host " [OK]" -ForegroundColor Green        Write-Host " ✓ 成功" -ForegroundColor Green

    }    }

    catch {    catch {

        if ($_.Exception.Response.StatusCode -eq 409) {        if ($_.Exception.Response.StatusCode -eq 409) {

            Write-Host " [Already exists]" -ForegroundColor Yellow            Write-Host " ⚠ 既に存在します" -ForegroundColor Yellow

        }        }

        else {        else {

            Write-Host " [Failed]" -ForegroundColor Red            Write-Host " ✗ 失敗" -ForegroundColor Red

            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red            Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red

        }        }

    }    }

}}



Write-Host ""Write-Host ""

Write-Host "Done!" -ForegroundColor GreenWrite-Host "完了しました！" -ForegroundColor Green

Write-Host "Meilisearch UI: $MEILI_URL" -ForegroundColor CyanWrite-Host "Meilisearch UI: $MEILI_URL" -ForegroundColor Cyan

