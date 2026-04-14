import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllCharacters() {
  try {
    console.log('🗑️  キャラクターデータを削除しています...')

    // 参照元テーブルを先に削除して外部キー制約エラーを回避する
    const [deletedFavoriteCharacters, deletedCharacterImages, deletedCharacters] = await prisma.$transaction([
      prisma.favoriteCharacter.deleteMany({}),
      prisma.characterImage.deleteMany({}),
      prisma.character.deleteMany({}),
    ])

    console.log(`✅ ${deletedFavoriteCharacters.count} 件のキャラお気に入りを削除しました`)
    console.log(`✅ ${deletedCharacterImages.count} 件のキャラ画像を削除しました`)
    console.log(`✅ ${deletedCharacters.count} 件のキャラクターを削除しました`)

    console.log('💡 必要に応じて検索インデックスを手動でクリアしてください。')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

console.log('⚠️  警告: このスクリプトは全てのキャラクターデータを削除します!')
console.log('継続するには Ctrl+C で中断するか、5秒待ってください...')

setTimeout(async () => {
  await deleteAllCharacters()
}, 5000)
