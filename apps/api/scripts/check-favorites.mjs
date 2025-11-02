// Check favorites in database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking favorites in database...\n')
  
  const favorites = await prisma.favorite.findMany({
    include: {
      asset: {
        select: {
          id: true,
          title: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  console.log(`Total favorites: ${favorites.length}\n`)
  
  if (favorites.length > 0) {
    console.log('Favorites:')
    favorites.forEach(fav => {
      console.log(`- User: ${fav.userId}`)
      console.log(`  Asset: ${fav.assetId} (${fav.asset?.title || 'No title'})`)
      console.log(`  Created: ${fav.createdAt}`)
      console.log('')
    })
  } else {
    console.log('No favorites found in database.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
