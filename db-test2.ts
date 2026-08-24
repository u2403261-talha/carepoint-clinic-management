import { db } from './src/db/index.ts';
import { doctors } from './src/db/schema.ts';

async function main() {
  const allDocs = await db.select().from(doctors);
  console.log(allDocs);
  process.exit(0);
}
main();
