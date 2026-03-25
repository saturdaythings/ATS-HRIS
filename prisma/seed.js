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
    where: { email: 'oliver@v.two' }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Oliver',
        email: 'oliver@v.two',
        password: await hashPassword('password123'),
        role: 'admin',
        active: true
      }
    });
    console.log('✅ Admin user created (oliver@v.two / password123)');
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
