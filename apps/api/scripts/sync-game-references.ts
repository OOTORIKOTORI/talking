import { GamesService } from '../src/games/games.service';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();
const games = new GamesService(prisma);

async function main() {
  await prisma.$connect();

  const rows = await prisma.gameProject.findMany({
    where: { deletedAt: null },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  let synced = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await games.syncGameReferences(row.id, prisma);
      synced += 1;
    } catch (error) {
      failed += 1;
      console.error(`[sync-game-references] failed gameId=${row.id}`);
      console.error(error);
    }
  }

  console.log(`[sync-game-references] done synced=${synced} failed=${failed} total=${rows.length}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('[sync-game-references] fatal error');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
