import serverless from 'serverless-http';
import express, { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { db } from '../../src/db'; // Double check this path points to your database instance
import { doctors, users } from '../../src/db/schema'; // Double check this path points to your database schema
import { eq } from 'drizzle-orm';

// 1. Initialize Firebase Admin SDK safely for Serverless
if (!admin.apps.length) {
  admin.initializeApp({
    // Netlify pulls this from your Site Configuration Environment Variables
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  });
}

const app = express();
app.use(express.json());

// 2. Extend standard Express Request interface to safely type req.user
interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

// 3. Real Authentication Middleware
const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Authorization header is missing or malformed");
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Inject the decoded token payload (including uid, email) into the request object
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// 4. Main Authentication Sync Route
// 4. Main Authentication Sync Route
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const name = req.user!.name || req.body.name || 'Unknown User';
    const role = req.body.role || 'USER'; 
    const doctorData = req.body.doctorData;

    console.log(`Attempting connection to NeonDB for user: ${uid}`);

    // Test if db instance exists
    if (!db) {
      throw new Error("Database instance configuration is uninitialized or missing.");
    }

    // Database Lookup: Get or Create User with explicit catch
    let existingUser;
    try {
      existingUser = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    } catch (dbError: any) {
      console.error(" NeonDB Query Failed immediately:", dbError.message);
      return res.status(502).json({ 
        error: 'Database connection failed. Verify Netlify Environment variables.',
        details: dbError.message 
      });
    }
    
    let userRecord = existingUser[0];

    if (existingUser.length === 0) {
      try {
        const newUser = await db.insert(users).values({
          id: uid,
          email: email,
          name: name,
          role: role,
        }).returning();
        userRecord = newUser[0];
      } catch (insertError: any) {
        console.error("Failed to insert user records:", insertError.message);
        return res.status(500).json({ error: 'Database record instantiation failed.' });
      }
    }

    // Role Specific logic: Handle Doctor registration sync
    if (userRecord && userRecord.role === 'DOCTOR' && doctorData) {
      const existingDoc = await db.select().from(doctors).where(eq(doctors.userId, userRecord.id)).limit(1);
      if (existingDoc.length === 0) {
        await db.insert(doctors).values({
          userId: userRecord.id,
          specialization: doctorData.specialization,
          departmentId: parseInt(doctorData.departmentId, 10),
          qualification: doctorData.qualification,
          experience: parseInt(doctorData.experience, 10),
          registrationNumber: doctorData.registrationNumber
        });
      }
    }

    res.json(userRecord || { id: uid, role, name, email });
  } catch (error: any) {
    console.error('General sync route failure:', error);
    res.status(500).json({ error: 'Failed to sync user data smoothly' });
  }
});


// Fallback catch-all route handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: "Route not explicitly found inside api.ts" });
});

// 5. Wrap Express App with Serverless Handler
export const handler = serverless(app);
