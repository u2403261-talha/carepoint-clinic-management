import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env explicitly from the root
dotenv.config({ path: resolve(process.cwd(), ".env") });

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_USER;
const password = process.env.SQL_PASSWORD;

if (!sqlHost || !sqlDbName || !user || !password) {
  console.error("❌ CRITICAL ERROR: Database environment variables are missing!");
  console.error("Make sure you have a '.env' file in the root of your project.");
  process.exit(1);
}

const pool = new Pool({
  host: sqlHost,
  user: user,
  password: password,
  database: sqlDbName,
  ssl: { rejectUnauthorized: false }, // Essential for Neon on Windows
});

const db = drizzle(pool);

async function main() {
  console.log("=========================================");
  console.log("⏳ Starting Database Migration...");
  console.log(`📡 Host: ${sqlHost}`);
  console.log(`🗄️  Database: ${sqlDbName}`);
  console.log(`👤 User: ${user}`);
  console.log("🔑 Password: [HIDDEN]");
  console.log("=========================================");

  try {
    console.log("Applying migrations from /drizzle folder...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("✅ Migrations applied successfully!");
    
    // Validate that tables were created
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = res.rows.map(r => r.table_name);
    console.log(`📊 Found ${tables.length} tables in public schema:`);
    console.log(tables.join(", "));
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed!");
    console.error(error);
    process.exit(1);
  }
}

main();
