import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const base = process.env.S3_PUBLIC_BASE;
if (!base) {
  console.error('S3_PUBLIC_BASE が未設定です');
  process.exit(1);
}

const assets = await prisma.asset.findMany();
let n = 0;

for (const a of assets) {
  if (!a.url || a.url.startsWith('undefined')) {
    const url = `${base}/${a.key}`;
    await prisma.asset.update({ where: { id: a.id }, data: { url } });
    n++;
  }
}

console.log(`fixed ${n} assets`);
await prisma.$disconnect();
