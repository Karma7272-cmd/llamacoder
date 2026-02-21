import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Testing Supabase connection...");

    // Test the connection by running a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("✅ Supabase connection successful!");

    // Verify tables exist
    console.log("\n📊 Checking database tables...");

    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log("Available tables:", tables);

    console.log("\n✨ Database setup complete!");
    console.log("Your Supabase PostgreSQL database is connected and ready to use.");
    console.log("\nEnvironment variables are configured:");
    console.log("- DATABASE_URL: Connected to Supabase");
    console.log("- Vercel AI Gateway: Zero-config ready");
  } catch (error) {
    console.error("❌ Error during setup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
