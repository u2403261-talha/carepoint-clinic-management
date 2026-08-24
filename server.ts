import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { db } from './src/db/index.ts';
import { users, doctors, departments, appointments, prescriptions, deletedAccounts } from './src/db/schema.ts';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { getOrCreateUser } from './src/db/users.ts';
import crypto from 'crypto';

import { seedDepartments } from './src/db/seed.ts';
import doctorRoutes from './src/api/doctorRoutes.ts';

const app = express();

export { app };

const initApp = () => {
  const PORT = 3000;
  
  

  app.use(express.json());
  app.use('/api/doctors', doctorRoutes);
  
  // Seed database
  // Seed database in background
  seedDepartments().catch(e => console.error('Error seeding departments:', e));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Sync user profile from Firebase
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || '';
      const name = req.user!.name || req.body.name || 'Unknown User';
      const role = req.body.role;
      const doctorData = req.body.doctorData;
      const user = await getOrCreateUser(uid, email, name, role);

      if (user.role === 'DOCTOR' && doctorData) {
        // Create doctor record if it doesn't exist
        const existingDoc = await db.select().from(doctors).where(eq(doctors.userId, user.id)).limit(1);
        if (existingDoc.length === 0) {
          await db.insert(doctors).values({
            userId: user.id,
            specialization: doctorData.specialization,
            departmentId: parseInt(doctorData.departmentId, 10),
            qualification: doctorData.qualification,
            experience: parseInt(doctorData.experience, 10),
            registrationNumber: doctorData.registrationNumber
          });
        }
      }

      res.json(user);
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Get current user profile
  app.get('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const result = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(result[0]);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.delete('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const userRes = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      
      if (userRes.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentUser = userRes[0];

      if (currentUser.role === 'ADMIN') {
        // Check if there are other active admins
        const admins = await db.select().from(users).where(and(eq(users.role, 'ADMIN'), eq(users.status, 'ACTIVE')));
        if (admins.length <= 1) {
          return res.status(400).json({ error: 'Cannot delete the last administrator account.' });
        }
      }

      // We should anonymize the user to preserve clinical records
      const anonymizedUid = `deleted-${Date.now()}-${currentUser.id}`;
      
      // Save administrative record
      await db.insert(deletedAccounts).values({
        originalUid: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        registeredAt: currentUser.createdAt
      });

      await db.update(users)
        .set({
          uid: anonymizedUid,
          name: 'Deleted User',
          email: 'deleted@example.com',
          phone: null,
          dob: null,
          status: 'DELETED'
        })
        .where(eq(users.id, currentUser.id));

      // Also anonymize doctor info if role is DOCTOR
      if (currentUser.role === 'DOCTOR') {
         await db.update(doctors)
           .set({
             bio: null,
             registrationNumber: 'DELETED',
             workingDays: null,
             startTime: null,
             endTime: null
           })
           .where(eq(doctors.userId, currentUser.id));
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // Get departments
  app.get('/api/departments', async (req, res) => {
    try {
      const deps = await db.select().from(departments).where(eq(departments.active, true));
      res.json(deps);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  // Add a department
  app.post('/api/admin/departments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name } = req.body;
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'ADMIN' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const dept = await db.insert(departments).values({ name }).returning();
      res.json(dept[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add department' });
    }
  });

  // Get active doctors
  app.get('/api/doctors', async (req, res) => {
    try {
      // Need a join to get doctor user info
      const activeDoctors = await db
        .select({
          id: doctors.id,
          name: users.name,
          email: users.email,
          specialization: doctors.specialization,
          qualification: doctors.qualification,
          experience: doctors.experience,
          bio: doctors.bio,
          workingDays: doctors.workingDays,
          startTime: doctors.startTime,
          endTime: doctors.endTime,
          slotDuration: doctors.slotDuration,
          departmentId: doctors.departmentId
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(users.status, 'ACTIVE'));
      res.json(activeDoctors);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  });
  
  // Get appointments for doctor
  app.get('/api/doctors/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
      if (doctorRes.length === 0) return res.status(404).json({ error: 'Doctor profile not found' });

      const doctorAppointments = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          status: appointments.status,
          reason: appointments.reason,
          patientName: users.name,
        })
        .from(appointments)
        .innerJoin(users, eq(appointments.patientId, users.id))
        .where(eq(appointments.doctorId, doctorRes[0].id))
        .orderBy(desc(appointments.date), desc(appointments.startTime));

      res.json(doctorAppointments);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // Get doctor details by ID
  app.get('/api/doctors/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activeDoctor = await db
        .select({
          id: doctors.id,
          name: users.name,
          email: users.email,
          specialization: doctors.specialization,
          qualification: doctors.qualification,
          experience: doctors.experience,
          bio: doctors.bio,
          workingDays: doctors.workingDays,
          startTime: doctors.startTime,
          endTime: doctors.endTime,
          slotDuration: doctors.slotDuration,
          departmentId: doctors.departmentId
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(and(eq(doctors.id, id), eq(users.status, 'ACTIVE')))
        .limit(1);
        
      if (activeDoctor.length === 0) return res.status(404).json({ error: 'Doctor not found' });
      res.json(activeDoctor[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch doctor details' });
    }
  });

  // Get doctor availability
  app.get('/api/doctors/:id/availability', requireAuth, async (req: AuthRequest, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const { date } = req.query;
      
      const docRes = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
      if (docRes.length === 0) return res.status(404).json({ error: 'Doctor not found' });
      const doc = docRes[0];

      if (!doc.startTime || !doc.endTime) {
        return res.json({ slots: [] });
      }

      // Generate all slots
      const slots = [];
      let [currH, currM] = doc.startTime.split(':').map(Number);
      const [endH, endM] = doc.endTime.split(':').map(Number);
      const duration = doc.slotDuration || 20;

      while (currH < endH || (currH === endH && currM < endM)) {
        slots.push(`${currH.toString().padStart(2, '0')}:${currM.toString().padStart(2, '0')}`);
        currM += duration;
        if (currM >= 60) {
          currH += Math.floor(currM / 60);
          currM = currM % 60;
        }
      }

      // Get booked appointments for that date
      const booked = await db.select().from(appointments)
        .where(and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date as string),
          eq(appointments.status, 'PENDING')
        ));
        
      const confirmed = await db.select().from(appointments)
        .where(and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date as string),
          eq(appointments.status, 'CONFIRMED')
        ));
      
      const bookedSlots = new Set([...booked.map(a => a.startTime), ...confirmed.map(a => a.startTime)]);
      const availableSlots = slots.filter(s => !bookedSlots.has(s));

      res.json({ slots: availableSlots });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  });

  // Book appointment
  app.post('/api/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { doctorId, date, startTime, reason } = req.body;
      const userResult = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = userResult[0];

      // Prevent duplicate bookings for same doctor, date, and time
      const existing = await db.select().from(appointments)
        .where(and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date),
          eq(appointments.startTime, startTime),
          eq(appointments.status, 'PENDING') // Or CONFIRMED
        ));
      
      const conflicting = existing.filter(a => a.status !== 'CANCELLED' && a.status !== 'REJECTED');
      if (conflicting.length > 0) {
        return res.status(409).json({ error: 'Time slot already booked' });
      }

      const ticketId = crypto.randomBytes(4).toString('hex').toUpperCase();

      try {
        const newAppointment = await db.insert(appointments).values({
          patientId: user.id,
          doctorId: parseInt(doctorId),
          date,
          startTime,
          reason,
          ticketId,
          status: 'PENDING'
        }).returning();

        res.json(newAppointment[0]);
      } catch (dbError: any) {
        if (dbError.code === '23505' || dbError.message.includes('unique')) {
          return res.status(409).json({ success: false, message: 'Appointment slot is no longer available.', code: 'SLOT_UNAVAILABLE' });
        }
        throw dbError;
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ error: 'Failed to book appointment' });
    }
  });

  // Get admin stats
  app.get('/api/admin/stats', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'ADMIN' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const allUsers = await db.select().from(users);
      const allAppts = await db.select().from(appointments);
      const allDeleted = await db.select().from(deletedAccounts);

      const stats = {
        totalPatients: allUsers.filter(u => u.role === 'PATIENT').length,
        activeDoctors: allUsers.filter(u => u.role === 'DOCTOR' && u.status === 'ACTIVE').length,
        pendingDoctors: allUsers.filter(u => u.role === 'DOCTOR' && u.status === 'PENDING').length,
        todayAppointments: allAppts.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
        completedAppointments: allAppts.filter(a => a.status === 'COMPLETED').length,
        cancelledAppointments: allAppts.filter(a => a.status === 'CANCELLED').length,
        totalAppointments: allAppts.length,
        deletedAccounts: allDeleted.length,
      };
      res.json(stats);
    } catch(e) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Get deleted accounts
  app.get('/api/admin/deleted-accounts', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'ADMIN' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const deleted = await db.select().from(deletedAccounts).orderBy(desc(deletedAccounts.deletedAt));
      res.json(deleted);
    } catch (e) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Get all patients
  app.get('/api/admin/patients', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'ADMIN' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const allPatients = await db.select().from(users).where(eq(users.role, 'PATIENT')).orderBy(desc(users.createdAt));
      const allAppts = await db.select().from(appointments);
      
      const enrichedPatients = allPatients.map(p => ({
        ...p,
        appointmentsCount: allAppts.filter(a => a.patientId === p.id).length
      }));
      
      res.json(enrichedPatients);
    } catch (e) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Get all doctors (including active ones)
  app.get('/api/admin/doctors', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'ADMIN' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const allDocs = await db.select({
        id: doctors.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
        specialization: doctors.specialization,
        qualification: doctors.qualification,
      })
      .from(doctors)
      .innerJoin(users, eq(users.id, doctors.userId))
      .orderBy(desc(users.createdAt));
      
      res.json(allDocs);
    } catch (e) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Get pending doctors
  app.get('/api/admin/doctors/pending', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'ADMIN' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const pendingDoctors = await db
        .select({
          id: doctors.id,
          userId: users.id,
          name: users.name,
          email: users.email,
          specialization: doctors.specialization,
          qualification: doctors.qualification,
          experience: doctors.experience,
          registrationNumber: doctors.registrationNumber
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(users.status, 'PENDING'));

      res.json(pendingDoctors);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch pending doctors' });
    }
  });

  // Approve doctor
  app.post('/api/admin/doctors/:id/approve', requireAuth, async (req: AuthRequest, res) => {
    try {
      const adminRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (adminRes.length === 0 || adminRes[0].role !== 'ADMIN' || adminRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      const doctorId = parseInt(req.params.id);
      const doctorRes = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
      if (doctorRes.length === 0) return res.status(404).json({ error: 'Doctor not found' });

      await db.update(users).set({ status: 'ACTIVE' }).where(eq(users.id, doctorRes[0].userId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to approve doctor' });
    }
  });


  // Update Patient Profile
  app.put('/api/users/me/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, phone, dob, gender } = req.body;
      
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0) return res.status(404).json({ error: 'User not found' });
      
      const user = userRes[0];
      
      await db.update(users)
        .set({ 
          name: name || user.name, 
          phone: phone !== undefined ? phone : user.phone,
          dob: dob !== undefined ? dob : user.dob
        })
        .where(eq(users.id, user.id));
        
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Update Doctor Profile
  app.put('/api/doctors/me/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, phone, qualification, specialization, experience, bio, registrationNumber } = req.body;
      
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'DOCTOR') return res.status(404).json({ error: 'Doctor not found' });
      
      const user = userRes[0];
      
      await db.update(users)
        .set({ 
          name: name || user.name, 
          phone: phone !== undefined ? phone : user.phone
        })
        .where(eq(users.id, user.id));
        
      const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, user.id)).limit(1);
      if (doctorRes.length > 0) {
        await db.update(doctors)
          .set({
            qualification: qualification || doctorRes[0].qualification,
            specialization: specialization || doctorRes[0].specialization,
            experience: experience !== undefined ? parseInt(experience) : doctorRes[0].experience,
            bio: bio !== undefined ? bio : doctorRes[0].bio,
            registrationNumber: registrationNumber || doctorRes[0].registrationNumber
          })
          .where(eq(doctors.id, doctorRes[0].id));
      }
        
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Update doctor schedule
  app.post('/api/doctors/schedule', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { workingDays, startTime, endTime, slotDuration, blockedDates } = req.body;
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });

      await db.update(doctors)
        .set({ workingDays, startTime, endTime, slotDuration: parseInt(slotDuration), blockedDates })
        .where(eq(doctors.userId, userRes[0].id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  });


  
  // Update patient profile
  app.put('/api/patient/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, phone, dob, gender } = req.body;
      const userRes = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
      if (userRes.length === 0 || userRes[0].role !== 'PATIENT') return res.status(403).json({ error: 'Forbidden' });
      
      await db.update(users)
        .set({ name, phone, dob })
        .where(eq(users.id, userRes[0].id));
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.get('/api/patient/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = userResult[0];

      const patientAppointments = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          status: appointments.status,
          reason: appointments.reason,
          ticketId: appointments.ticketId,
          doctorName: users.name,
          specialization: doctors.specialization
        })
        .from(appointments)
        .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
        // Alias for the doctor's user account
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(appointments.patientId, user.id))
        .orderBy(desc(appointments.date), desc(appointments.startTime));

      res.json(patientAppointments);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // Update appointment status
  app.put('/api/appointments/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      const user = userRes[0];
      
      const appointmentId = parseInt(req.params.id);
      const apptRes = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
      if (apptRes.length === 0) return res.status(404).json({ error: 'Not found' });
      const appt = apptRes[0];

      if (user.role === 'PATIENT') {
        if (appt.patientId !== user.id || status !== 'CANCELLED') return res.status(403).json({ error: 'Forbidden' });
      } else if (user.role === 'DOCTOR') {
        const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, user.id)).limit(1);
        if (doctorRes.length === 0 || appt.doctorId !== doctorRes[0].id) return res.status(403).json({ error: 'Forbidden' });
      }
      
      // If cancelling or rejecting, modify startTime to release the unique slot for other patients
      let updatePayload: any = { status };
      if (status === 'CANCELLED' || status === 'REJECTED') {
        updatePayload.startTime = `${appt.startTime}_${Date.now()}`;
      }

      await db.update(appointments).set(updatePayload).where(eq(appointments.id, appointmentId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Doctor adds consultation
  app.post('/api/appointments/:id/consultation', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { symptoms, diagnosis, notes, recommendations, prescriptions: newPrescriptions } = req.body;
      const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
      const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);

      const appointmentId = parseInt(req.params.id);
      const apptRes = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
      if (apptRes.length === 0 || apptRes[0].doctorId !== doctorRes[0].id) return res.status(403).json({ error: 'Forbidden' });

      await db.update(appointments).set({ 
        symptoms, diagnosis, notes, recommendations, status: 'COMPLETED' 
      }).where(eq(appointments.id, appointmentId));

      if (newPrescriptions && Array.isArray(newPrescriptions)) {
        for (const p of newPrescriptions) {
          await db.insert(prescriptions).values({
            appointmentId,
            medicine: p.medicine,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: p.duration,
            instructions: p.instructions
          });
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save consultation' });
    }
  });

  // Get prescriptions for patient
  app.get('/api/patient/prescriptions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
      if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = userResult[0];

      const patientPrescriptions = await db
        .select({
          id: prescriptions.id,
          medicine: prescriptions.medicine,
          dosage: prescriptions.dosage,
          frequency: prescriptions.frequency,
          duration: prescriptions.duration,
          instructions: prescriptions.instructions,
          date: appointments.date,
          doctorName: users.name
        })
        .from(prescriptions)
        .innerJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
        .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(appointments.patientId, user.id))
        .orderBy(desc(appointments.date));

      res.json(patientPrescriptions);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
  });

  // Vite middleware for development
    // end of initApp
};

initApp();

async function startServer() {
  if (process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT) return;
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
