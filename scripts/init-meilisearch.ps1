# Meilisearch インデックス初期化スクリプト

# 使用方法: .\scripts\init-meilisearch.ps1

$MEILI_URL = "http://localhost:7700"
$MEILI_KEY = "masterKey123"

$headers = @{
    Authorization = "Bearer $MEILI_KEY"
}

$indexes = @("assets", "games", "conversations")

Write-Host "Meilisearch インデックスを初期化します..." -ForegroundColor Cyan
Write-Host "URL: $MEILI_URL" -ForegroundColor Gray
Write-Host ""

foreach ($index in $indexes) {
    try {
        Write-Host "インデックス '$index' を作成中..." -NoNewline
        
        $body = @{
            uid = $index
        } | ConvertTo-Json
        
        $null = Invoke-RestMethod `
            -Uri "$MEILI_URL/indexes" `
            -Method Post `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $body
        
        Write-Host "  成功" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  既に存在します" -ForegroundColor Yellow
        }
        else {
            Write-Host "  失敗" -ForegroundColor Red
            Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Configure filterable and sortable attributes for assets index
Write-Host ""
Write-Host "assets インデックスの設定を構成中..." -ForegroundColor Cyan

try {
    $settingsBody = @{
        filterableAttributes = @("contentType", "primaryTag", "tags", "ownerId")
        sortableAttributes = @("createdAt")
    } | ConvertTo-Json

    $null = Invoke-RestMethod `
        -Uri "$MEILI_URL/indexes/assets/settings" `
        -Method Patch `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $settingsBody

    Write-Host "  assets インデックスの設定を更新しました" -ForegroundColor Green
}
catch {
    Write-Host "  設定の更新に失敗しました" -ForegroundColor Red
    Write-Host "  エラー: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "完了しました！" -ForegroundColor Green
Write-Host "Meilisearch UI: $MEILI_URL" -ForegroundColor Cyan
