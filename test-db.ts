import { db } from './src/db/index.ts';
import { departments } from './src/db/schema.ts';

async function test() {
  console.log('Testing DB connection...');
  try {
    const deps = await db.select().from(departments);
    console.log('Found departments:', deps.length);
    console.log('DB SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('DB ERROR:', e);
    process.exit(1);
  }
}
test();
