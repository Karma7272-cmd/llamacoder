#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma Client generated\n');

    // Deploy migrations
    console.log('🔄 Deploying database migrations...');
    await execAsync('npx prisma migrate deploy');
    console.log('✅ Migrations deployed\n');

    // Push schema (for development)
    console.log('📝 Pushing schema to database...');
    await execAsync('npx prisma db push');
    console.log('✅ Schema pushed\n');

    console.log('✨ Database setup complete!');
    console.log('\n📊 Database Summary:');
    console.log('   - GeneratedApp table: Stores generated code apps');
    console.log('   - Chat table: Stores chat conversations');
    console.log('   - Message table: Stores individual messages in chats');
    console.log('\n🔑 Environment Variables Configured:');
    console.log('   - SUPABASE_URL');
    console.log('   - SUPABASE_ANON_KEY');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   - DATABASE_URL (Postgres)');
    console.log('\n✅ Ready to use Supabase and Vercel AI Gateway!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
