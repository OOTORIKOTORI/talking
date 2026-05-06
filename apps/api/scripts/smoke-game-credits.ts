/**
 * smoke-game-credits.ts
 * 
 * APIレスポンス互換確認スクリプト（読み取り専用）
 * /games/:id/credits のレスポンス構造をsmoke test します。
 * 
 * 役割:
 * - 公開ゲーム1件を取得
 * - GamesService.getCredits を呼び出し（HTTP経由でなく直接）
 * - レスポンス構造の互換性を検証
 *   - assetCredits / characterCredits / counts / checkedAt が存在するか
 *   - 各 credit item に必須フィールドがあるか
 * - GameCredit 優先経路が使用されたかどうかを判定・ログ出力
 * - 失敗時は exit 1、成功時は gameId と件数を表示して exit 0
 * 
 * 使用法:
 *   pnpm -C apps/api smoke:game-credits [--gameId <id>]
 */

import { GamesService } from '../src/games/games.service';
import { PrismaService } from '../src/prisma/prisma.service';

type GameCreditsResult = {
  gameId: string;
  assetCredits: Array<{
    assetId: string;
    title: string;
    ownerId: string | null;
    ownerDisplayName: string | null;
    contentType: string | null;
    primaryTag: string | null;
    usageCount: number;
    fields: Array<{ field: string; label: string; count: number }>;
    status: 'active' | 'deleted' | 'missing' | 'private';
    linkable: boolean;
    usageTerms: string | null;
    creditRequired: boolean;
  }>;
  characterCredits: Array<{
    characterId: string;
    displayName: string;
    name: string;
    ownerId: string | null;
    ownerDisplayName: string | null;
    usageCount: number;
    fields: Array<{ field: string; label: string; count: number }>;
    status: 'active' | 'deleted' | 'missing' | 'private';
    linkable: boolean;
    usageTerms: string | null;
    creditRequired: boolean;
  }>;
  counts: {
    assets: number;
    characters: number;
    total: number;
  };
  checkedAt: string;
};

interface SmokeTestContext {
  gameId: string;
  hasGameCredits: boolean;
  usedFallback: boolean;
  assetCreditsCount: number;
  characterCreditsCount: number;
}

async function validateResponseStructure(response: unknown): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('レスポンスはオブジェクトである必要があります');
    return { valid: false, errors };
  }

  const obj = response as Record<string, any>;

  // Required fields
  if (!obj.gameId || typeof obj.gameId !== 'string') {
    errors.push('gameId (string) が必要です');
  }

  if (!Array.isArray(obj.assetCredits)) {
    errors.push('assetCredits (array) が必要です');
  } else {
    obj.assetCredits.forEach((item: any, idx: number) => {
      const itemErrors = validateAssetCreditItem(item);
      if (itemErrors.length > 0) {
        errors.push(`assetCredits[${idx}]: ${itemErrors.join(', ')}`);
      }
    });
  }

  if (!Array.isArray(obj.characterCredits)) {
    errors.push('characterCredits (array) が必要です');
  } else {
    obj.characterCredits.forEach((item: any, idx: number) => {
      const itemErrors = validateCharacterCreditItem(item);
      if (itemErrors.length > 0) {
        errors.push(`characterCredits[${idx}]: ${itemErrors.join(', ')}`);
      }
    });
  }

  if (!obj.counts || typeof obj.counts !== 'object') {
    errors.push('counts (object) が必要です');
  } else {
    if (typeof obj.counts.assets !== 'number') {
      errors.push('counts.assets (number) が必要です');
    }
    if (typeof obj.counts.characters !== 'number') {
      errors.push('counts.characters (number) が必要です');
    }
    if (typeof obj.counts.total !== 'number') {
      errors.push('counts.total (number) が必要です');
    }
  }

  if (!obj.checkedAt || typeof obj.checkedAt !== 'string') {
    errors.push('checkedAt (ISO string) が必要です');
  } else {
    try {
      new Date(obj.checkedAt);
    } catch {
      errors.push(`checkedAt が有効なISO日時ではありません: ${obj.checkedAt}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateAssetCreditItem(item: any): string[] {
  const errors: string[] = [];

  if (!item.assetId || typeof item.assetId !== 'string') errors.push('assetId が必要');
  if (!item.title || typeof item.title !== 'string') errors.push('title が必要');
  if (typeof item.ownerId !== 'string' && item.ownerId !== null) errors.push('ownerId は string | null である必要があります');
  if (typeof item.ownerDisplayName !== 'string' && item.ownerDisplayName !== null) errors.push('ownerDisplayName は string | null である必要があります');
  if (item.contentType !== null && typeof item.contentType !== 'string') errors.push('contentType は string | null である必要があります');
  if (item.primaryTag !== null && typeof item.primaryTag !== 'string') errors.push('primaryTag は string | null である必要があります');
  if (typeof item.usageCount !== 'number') errors.push('usageCount は number である必要があります');
  if (!Array.isArray(item.fields)) errors.push('fields は array である必要があります');
  if (!['active', 'deleted', 'missing', 'private'].includes(item.status)) errors.push(`status が不正です: ${item.status}`);
  if (typeof item.linkable !== 'boolean') errors.push('linkable は boolean である必要があります');
  if (item.usageTerms !== null && typeof item.usageTerms !== 'string') errors.push('usageTerms は string | null である必要があります');
  if (typeof item.creditRequired !== 'boolean') errors.push('creditRequired は boolean である必要があります');

  return errors;
}

function validateCharacterCreditItem(item: any): string[] {
  const errors: string[] = [];

  if (!item.characterId || typeof item.characterId !== 'string') errors.push('characterId が必要');
  if (!item.displayName || typeof item.displayName !== 'string') errors.push('displayName が必要');
  if (!item.name || typeof item.name !== 'string') errors.push('name が必要');
  if (typeof item.ownerId !== 'string' && item.ownerId !== null) errors.push('ownerId は string | null である必要があります');
  if (typeof item.ownerDisplayName !== 'string' && item.ownerDisplayName !== null) errors.push('ownerDisplayName は string | null である必要があります');
  if (typeof item.usageCount !== 'number') errors.push('usageCount は number である必要があります');
  if (!Array.isArray(item.fields)) errors.push('fields は array である必要があります');
  if (!['active', 'deleted', 'missing', 'private'].includes(item.status)) errors.push(`status が不正です: ${item.status}`);
  if (typeof item.linkable !== 'boolean') errors.push('linkable は boolean である必要があります');
  if (item.usageTerms !== null && typeof item.usageTerms !== 'string') errors.push('usageTerms は string | null である必要があります');
  if (typeof item.creditRequired !== 'boolean') errors.push('creditRequired は boolean である必要があります');

  return errors;
}

async function detectGameCreditUsage(prisma: PrismaService, gameId: string): Promise<boolean> {
  const gameCredits = await prisma.gameCredit.findMany({
    where: {
      gameId,
      kind: {
        in: ['ASSET', 'CHARACTER'],
      },
    },
    take: 1,
  });

  return gameCredits.length > 0;
}

async function main() {
  const args = process.argv.slice(2);
  let gameId: string | null = null;

  // Parse --gameId argument
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--gameId' && args[i + 1]) {
      gameId = args[i + 1];
      break;
    }
  }

  const prisma = new PrismaService();
  await prisma.$connect();

  try {
    let targetGameId: string;

    if (gameId) {
      // Validate specified game exists
      const game = await prisma.gameProject.findUnique({
        where: { id: gameId },
        select: { id: true, isPublic: true, deletedAt: true },
      });

      if (!game) {
        console.error(`[smoke-game-credits] ゲームが見つかりません: ${gameId}`);
        process.exitCode = 1;
        return;
      }

      if (!game.isPublic) {
        console.error(`[smoke-game-credits] ゲームが公開ゲームではありません: ${gameId}`);
        process.exitCode = 1;
        return;
      }

      if (game.deletedAt) {
        console.error(`[smoke-game-credits] ゲームが削除済みです: ${gameId}`);
        process.exitCode = 1;
        return;
      }

      targetGameId = gameId;
    } else {
      // Get first public game
      const game = await prisma.gameProject.findFirst({
        where: { isPublic: true, deletedAt: null },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!game) {
        console.warn('[smoke-game-credits] 公開ゲームが見つかりません（スキップ）');
        process.exitCode = 0;
        return;
      }

      targetGameId = game.id;
    }

    console.log(`[smoke-game-credits] テスト対象 gameId=${targetGameId}`);

    // Create GamesService and call getCredits
    const gamesService = new GamesService(prisma);
    const response = await gamesService.getCredits(undefined, targetGameId);

    // Validate response structure
    const { valid, errors } = await validateResponseStructure(response);

    if (!valid) {
      console.error('[smoke-game-credits] レスポンス構造が不正です:');
      errors.forEach((err) => console.error(`  - ${err}`));
      process.exitCode = 1;
      return;
    }

    // Detect GameCredit usage
    const hasGameCredits = await detectGameCreditUsage(prisma, targetGameId);

    const typedResponse = response as GameCreditsResult;
    console.log('[smoke-game-credits] ✓ レスポンス構造は有効です');
    console.log(`  gameId: ${typedResponse.gameId}`);
    console.log(`  assetCredits: ${typedResponse.assetCredits.length} 件`);
    console.log(`  characterCredits: ${typedResponse.characterCredits.length} 件`);
    console.log(`  counts: { assets: ${typedResponse.counts.assets}, characters: ${typedResponse.counts.characters}, total: ${typedResponse.counts.total} }`);
    console.log(`  checkedAt: ${typedResponse.checkedAt}`);
    console.log(`  GameCredit表: ${hasGameCredits ? '有（優先経路使用）' : '無（fallback経路使用）'}`);

    // Show sample items if any
    if (typedResponse.assetCredits.length > 0) {
      const sample = typedResponse.assetCredits[0];
      console.log(`\n  assetCredits[0] (sample):`);
      console.log(`    assetId: ${sample.assetId}`);
      console.log(`    title: ${sample.title}`);
      console.log(`    ownerDisplayName: ${sample.ownerDisplayName || '(null)'}`);
      console.log(`    status: ${sample.status}`);
      console.log(`    usageCount: ${sample.usageCount}`);
      console.log(`    creditRequired: ${sample.creditRequired}`);
      console.log(`    usageTerms: ${sample.usageTerms ? '有' : '無'}`);
    }

    if (typedResponse.characterCredits.length > 0) {
      const sample = typedResponse.characterCredits[0];
      console.log(`\n  characterCredits[0] (sample):`);
      console.log(`    characterId: ${sample.characterId}`);
      console.log(`    displayName: ${sample.displayName}`);
      console.log(`    ownerDisplayName: ${sample.ownerDisplayName || '(null)'}`);
      console.log(`    status: ${sample.status}`);
      console.log(`    usageCount: ${sample.usageCount}`);
      console.log(`    creditRequired: ${sample.creditRequired}`);
      console.log(`    usageTerms: ${sample.usageTerms ? '有' : '無'}`);
    }

    console.log('\n[smoke-game-credits] ✓ smoke test 完了（問題なし）');
    process.exitCode = 0;
  } catch (error) {
    console.error('[smoke-game-credits] 予期しないエラー');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
