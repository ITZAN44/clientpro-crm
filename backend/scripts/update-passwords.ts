import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('🔐 Actualizando contraseñas de usuarios de prueba...\n');

  const usuarios = [
    'admin@clientpro.com',
    'manager.cdmx@clientpro.com',
    'manager.mty@clientpro.com',
    'juan.perez@clientpro.com',
    'maria.rodriguez@clientpro.com',
    'pedro.sanchez@clientpro.com',
    'sofia.torres@clientpro.com',
  ];

  for (const email of usuarios) {
    try {
      await prisma.usuario.update({
        where: { email },
        data: { passwordHash: hashedPassword },
      });
      console.log(`✅ ${email} - contraseña actualizada`);
    } catch (error) {
      console.log(`❌ ${email} - error: ${error.message}`);
    }
  }

  console.log('\n✅ Proceso completado!');
  console.log(`📝 Password para todos: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
