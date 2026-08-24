import { db } from './index.ts';
import { departments } from './schema.ts';

export async function seedDepartments() {
  const existing = await db.select().from(departments).limit(1);
  if (existing.length === 0) {
    console.log('Seeding initial departments...');
    await db.insert(departments).values([
      { name: 'Cardiology' },
      { name: 'Neurology' },
      { name: 'Pediatrics' },
      { name: 'Orthopedics' },
      { name: 'General Medicine' }
    ]);
    console.log('Departments seeded.');
  }
}
