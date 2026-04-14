import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllAssets() {
  try {
    console.log('🗑️  アセットデータを削除しています...')

    // Favorite は Asset を参照しているため先に削除する
    const [deletedFavorites, deletedAssets] = await prisma.$transaction([
      prisma.favorite.deleteMany({}),
      prisma.asset.deleteMany({}),
    ])

    console.log(`✅ ${deletedFavorites.count} 件のお気に入りを削除しました`)
    console.log(`✅ ${deletedAssets.count} 件のアセットを削除しました`)
    
    // Meilisearchのインデックスもクリア（オプション）
    console.log('💡 Meilisearchのインデックスは手動でクリアしてください:')
    console.log('   curl -X DELETE http://localhost:7700/indexes/assets/documents')
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 確認プロンプト
console.log('⚠️  警告: このスクリプトは全てのアセットデータを削除します!')
console.log('継続するには Ctrl+C で中断するか、5秒待ってください...')

setTimeout(async () => {
  await deleteAllAssets()
}, 5000)
