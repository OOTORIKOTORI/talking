import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllGames() {
  try {
    console.log('🗑️  ゲームデータを削除しています...')

    // 参照元テーブルを先に削除して外部キー制約エラーを回避する
    const [deletedChoices, deletedNodes, deletedScenes, deletedProjects] = await prisma.$transaction([
      prisma.gameChoice.deleteMany({}),
      prisma.gameNode.deleteMany({}),
      prisma.gameScene.deleteMany({}),
      prisma.gameProject.deleteMany({}),
    ])

    console.log(`✅ ${deletedChoices.count} 件の選択肢を削除しました`)
    console.log(`✅ ${deletedNodes.count} 件のノードを削除しました`)
    console.log(`✅ ${deletedScenes.count} 件のシーンを削除しました`)
    console.log(`✅ ${deletedProjects.count} 件のゲームを削除しました`)

    console.log('💡 Meilisearchのインデックスは必要に応じて手動でクリアしてください:')
    console.log('   curl -X DELETE http://localhost:7700/indexes/games/documents')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

console.log('⚠️  警告: このスクリプトは全てのゲームデータを削除します!')
console.log('継続するには Ctrl+C で中断するか、5秒待ってください...')

setTimeout(async () => {
  await deleteAllGames()
}, 5000)
