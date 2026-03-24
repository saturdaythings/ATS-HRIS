import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

async function main() {
  console.log('Starting seed...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: await hashPassword('changeme'),
        role: 'admin',
        active: true
      }
    });
    console.log('✅ Admin user created (admin@example.com / changeme)');
  } else {
    console.log('✅ Admin user already exists');
  }

  console.log('Seed complete');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
