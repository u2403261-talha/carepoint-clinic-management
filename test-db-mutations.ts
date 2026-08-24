import { db } from './src/db/index.ts';
import { departments } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function testMutations() {
  console.log('Starting DB Mutation Test...');
  try {
    // 1. INSERT
    const testName = 'QA_TEST_DEPT_' + Date.now();
    const inserted = await db.insert(departments).values({ name: testName }).returning();
    const newId = inserted[0].id;
    console.log(`INSERT SUCCESS: ID ${newId}`);

    // 2. UPDATE
    const updated = await db.update(departments)
      .set({ name: testName + '_UPDATED' })
      .where(eq(departments.id, newId))
      .returning();
    console.log(`UPDATE SUCCESS: New Name = ${updated[0].name}`);

    // 3. DELETE (Cleanup)
    await db.delete(departments).where(eq(departments.id, newId));
    console.log('DELETE SUCCESS: Cleanup complete');
    
    process.exit(0);
  } catch (e) {
    console.error('MUTATION ERROR:', e);
    process.exit(1);
  }
}
testMutations();
