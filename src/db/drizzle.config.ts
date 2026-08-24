import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Explicitly load .env from the root of the project
dotenv.config({ path: resolve(process.cwd(), ".env") });

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_USER;
const password = process.env.SQL_PASSWORD;

if (!sqlHost || !sqlDbName || !user || !password) {
  throw new Error(
    "❌ CRITICAL ERROR: Database environment variables are missing! \n" +
    "Drizzle could not find SQL_HOST, SQL_USER, SQL_PASSWORD, or SQL_DB_NAME. \n" +
    "Make sure you have a '.env' file in the root of your project and not '.env.txt'."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: true,
  },
  verbose: true,
});
