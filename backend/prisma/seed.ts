
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seed() {
  const topics = [
    { key: 'documental', name: 'Documental' },
    { key: 'street', name: 'Street Photography' },
    { key: 'landscape', name: 'Landscape' },
    { key: 'portrait', name: 'Portrait' },
    { key: 'nude', name: 'Nude' }
  ];
  for (const t of topics) {
    await prisma.topic.upsert({
      where: { key: t.key },
      update: {},
      create: t
    });
  }
  console.log('Temáticas sembradas');
}

seed().finally(()=>prisma.$disconnect());
