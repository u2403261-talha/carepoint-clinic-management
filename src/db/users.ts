import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name: string, requestedRole?: string) {
  const existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  
  let role = (email === 'admin@carepoint.local' || email === 'rafiqtalha5@gmail.com') ? 'ADMIN' : 'PATIENT';
  let status = 'ACTIVE';

  if (existingUser.length > 0) {
    role = existingUser[0].role;
    status = existingUser[0].status;
  }

  // If they explicitly requested DOCTOR (e.g. via doctor registration), override their role to DOCTOR for testing purposes
  if (requestedRole === 'DOCTOR') {
    role = 'DOCTOR';
    status = (email === 'admin@carepoint.local' || email === 'rafiqtalha5@gmail.com') ? 'ACTIVE' : 'PENDING';
  }

  const result = await db.insert(users)
    .values({
      uid,
      email,
      name,
      role,
      status
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        name,
        role,
        status
      },
    })
    .returning();

  return result[0];
}

export async function getUser(uid: string) {
  const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  return result[0] || null;
}
