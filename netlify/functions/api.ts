import serverless from 'serverless-http';
import express, { Request } from 'express';
import { db } from './db'; // Adjust this path if your database instance is separate
import { doctors, users } from './schema'; // Adjust your schema imports
import { eq } from 'drizzle-orm'; // Or your respective SQL package helper

const app = express();
app.use(express.json());

// Insert your mock or actual authentication middleware here
const requireAuth = (req: any, res: any, next: any) => {
  // Ensure req.user parsing logic matches your Firebase verification setup
  next();
};

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
}

// Keep your exact endpoint route here
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const name = req.user!.name || req.body.name || 'Unknown User';
    const role = req.body.role;
    const doctorData = req.body.doctorData;
    
    // Your logic to synchronize users
    const user = { id: 1, role, name, email }; // Place your actual getOrCreateUser database query here

    if (user.role === 'DOCTOR' && doctorData) {
      // Create doctor record logic
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Wrap and export the application instance for Netlify
export const handler = serverless(app);
