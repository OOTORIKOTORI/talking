import { GamesService } from '../src/games/games.service';
import { PrismaService } from '../src/prisma/prisma.service';

const args = process.argv.slice(2);

function parseArgs(argv: string[]): { gameId?: string; json: boolean } {
  let gameId: string | undefined;
  let json = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--gameId' && argv[i + 1]) {
      gameId = argv[i + 1];
      i++;
    } else if (argv[i] === '--json') {
      json = true;
    }
  }
  return { gameId, json };
}

const opts = parseArgs(args);
const prisma = new PrismaService();
const games = new GamesService(prisma);

async function main() {
  await prisma.$connect();

  const rows = opts.gameId
    ? [{ id: opts.gameId }]
    : await prisma.gameProject.findMany({
        where: { deletedAt: null },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

  let totalOk = 0;
  let totalNg = 0;
  const results: Array<Awaited<ReturnType<typeof games.checkGameReferences>>> = [];

  for (const row of rows) {
    try {
      const result = await games.checkGameReferences(row.id);
      results.push(result);
      if (result.ok) {
        totalOk += 1;
      } else {
        totalNg += 1;
      }
    } catch (error) {
      totalNg += 1;
      console.error(`[check-game-references] error gameId=${row.id}`);
      console.error(error);
    }
  }

  if (opts.json) {
    console.log(JSON.stringify({ results, summary: { ok: totalOk, ng: totalNg, total: rows.length } }, null, 2));
  } else {
    for (const r of results) {
      if (r.ok) continue;
      console.log(`\n[MISMATCH] gameId=${r.gameId}`);
      if (r.missingAssetIds.length > 0) {
        console.log(`  missing asset refs   : ${r.missingAssetIds.join(', ')}`);
      }
      if (r.extraAssetIds.length > 0) {
        console.log(`  extra asset refs     : ${r.extraAssetIds.join(', ')}`);
      }
      if (r.missingCharacterIds.length > 0) {
        console.log(`  missing character refs: ${r.missingCharacterIds.join(', ')}`);
      }
      if (r.extraCharacterIds.length > 0) {
        console.log(`  extra character refs  : ${r.extraCharacterIds.join(', ')}`);
      }
    }
    console.log(`\n[check-game-references] ok=${totalOk} ng=${totalNg} total=${rows.length}`);
  }

  if (totalNg > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('[check-game-references] fatal error');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
