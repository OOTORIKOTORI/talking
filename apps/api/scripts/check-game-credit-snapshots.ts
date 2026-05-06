import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

interface CheckResult {
  ok: boolean;
  publishedGamesWithUnlockedCredits: {
    gameId: string;
    count: number;
  }[];
  publishedGamesWithBadLockedCredits: {
    gameId: string;
    creditId: string;
    issues: string[];
  }[];
  errorCount: number;
}

async function main() {
  await prisma.$connect();

  const result: CheckResult = {
    ok: true,
    publishedGamesWithUnlockedCredits: [],
    publishedGamesWithBadLockedCredits: [],
    errorCount: 0,
  };

  // Get all published games
  const games = await prisma.gameProject.findMany({
    where: { isPublic: true, deletedAt: null },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const game of games) {
    try {
      // Check for unlocked credits in published games
      const unlockedCredits = await prisma.gameCredit.findMany({
        where: { gameId: game.id, snapshotLockedAt: null },
        select: { id: true },
      });

      if (unlockedCredits.length > 0) {
        result.ok = false;
        result.publishedGamesWithUnlockedCredits.push({
          gameId: game.id,
          count: unlockedCredits.length,
        });
        console.warn(
          `[check-game-credit-snapshots] published game ${game.id} has ${unlockedCredits.length} unlocked credits`
        );
      }

      // Check locked credits for valid snapshot data
      const lockedCredits = await prisma.gameCredit.findMany({
        where: { gameId: game.id, snapshotLockedAt: { not: null } },
        select: {
          id: true,
          sourceNameSnapshot: true,
          usageTermsSnapshot: true,
          creditRequiredSnapshot: true,
        },
      });

      for (const credit of lockedCredits) {
        const issues: string[] = [];
        if (!credit.sourceNameSnapshot) {
          issues.push('sourceNameSnapshot is empty');
        }
        if (credit.creditRequiredSnapshot === null) {
          issues.push('creditRequiredSnapshot is null');
        }
        if (issues.length > 0) {
          result.ok = false;
          result.publishedGamesWithBadLockedCredits.push({
            gameId: game.id,
            creditId: credit.id,
            issues,
          });
          console.warn(
            `[check-game-credit-snapshots] published game ${game.id} credit ${credit.id} has issues: ${issues.join(', ')}`
          );
        }
      }
    } catch (error) {
      result.ok = false;
      result.errorCount += 1;
      console.error(`[check-game-credit-snapshots] error checking game ${game.id}`);
      console.error(error);
    }
  }

  await prisma.$disconnect();

  console.log('[check-game-credit-snapshots] result:', JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(1);
  }
}

main();
