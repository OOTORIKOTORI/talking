import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const latest = await prisma.asset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, title: true, contentType: true, ownerId: true, createdAt: true },
  })
  
  console.log('\n=== Latest 10 assets ===')
  latest.forEach(a => {
    console.log(`${a.createdAt.toISOString()}  id=${a.id}  ownerId=${a.ownerId ?? '(null)'}  ct=${a.contentType}  title=${a.title ?? ''}`)
  })
  
  console.log(`\nTotal assets found: ${latest.length}`)
}

main().finally(() => prisma.$disconnect())
