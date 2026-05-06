import { GamesService } from '../src/games/games.service';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();
const games = new GamesService(prisma);

async function main() {
  await prisma.$connect();

  // Find all published games
  const rows = await prisma.gameProject.findMany({
    where: { isPublic: true, deletedAt: null },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  let locked = 0;
  let alreadyLocked = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      // Sync references and credits to ensure they are up to date
      await games.syncGameReferences(row.id, prisma);
      await games.syncGameCredits(row.id, prisma);

      // Lock any unlocked credits for this published game
      const now = new Date();
      const result = await prisma.gameCredit.updateMany({
        where: { gameId: row.id, snapshotLockedAt: null },
        data: { snapshotLockedAt: now },
      });

      if (result.count > 0) {
        locked += result.count;
        console.log(`[lock-game-credit-snapshots] locked gameId=${row.id} count=${result.count}`);
      } else {
        alreadyLocked += 1;
      }
    } catch (error) {
      failed += 1;
      console.error(`[lock-game-credit-snapshots] failed gameId=${row.id}`);
      console.error(error);
    }
  }

  await prisma.$disconnect();

  console.log(
    `[lock-game-credit-snapshots] done locked=${locked} alreadyLocked=${alreadyLocked} failed=${failed} total=${rows.length}`
  );

  if (failed > 0) process.exit(1);
}

main();
