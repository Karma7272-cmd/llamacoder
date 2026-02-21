import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function initializeDatabase() {
  try {
    console.log('[v0] Step 1: Generating Prisma Client...');
    await execAsync('npx prisma generate', { cwd: process.cwd() });
    console.log('[v0] ✓ Prisma Client generated successfully');

    console.log('[v0] Step 2: Running database migrations...');
    await execAsync('npx prisma migrate deploy', { cwd: process.cwd() });
    console.log('[v0] ✓ Database migrations deployed successfully');

    console.log('[v0] Step 3: Verifying Supabase connection...');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('[v0] ✓ Supabase connection verified');

    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('[v0] ✓ Database tables:', JSON.stringify(tables, null, 2));

    await prisma.$disconnect();
    console.log('[v0] ✓ Database initialization complete!');
  } catch (error) {
    console.error('[v0] Error during database initialization:', error);
    process.exit(1);
  }
}

initializeDatabase();
