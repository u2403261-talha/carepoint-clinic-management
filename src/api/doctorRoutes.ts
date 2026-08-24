import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { db } from '../db/index.ts';
import { users, doctors, appointments, prescriptions, departments } from '../db/schema.ts';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

const router = express.Router();

// Get doctor profile
router.get('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userRes = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    
    res.json({
      user: userRes[0],
      doctor: doctorRes.length > 0 ? doctorRes[0] : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
});

// Update doctor profile
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, phone, qualification, specialization, departmentId, experience, bio, registrationNumber } = req.body;
    
    const userRes = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR') return res.status(403).json({ error: 'Forbidden' });
    
    // Update user table
    await db.update(users)
      .set({ name, phone })
      .where(eq(users.id, userRes[0].id));
      
    // Update doctor table
    await db.update(doctors)
      .set({ 
        qualification, 
        specialization, 
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        experience: experience ? parseInt(experience, 10) : 0, 
        bio,
        registrationNumber
      })
      .where(eq(doctors.userId, userRes[0].id));
      
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
});


// Get doctor's dashboard stats
router.get('/dashboard/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    const doctor = doctorRes[0];
    
    const today = new Date().toISOString().split('T')[0];
    
    const allApps = await db.select().from(appointments).where(eq(appointments.doctorId, doctor.id));
    
    const todayAppointments = allApps.filter(a => a.date === today).length;
    const pendingAppointments = allApps.filter(a => a.status === 'PENDING').length;
    const confirmedAppointments = allApps.filter(a => a.status === 'CONFIRMED').length;
    const completedAppointments = allApps.filter(a => a.status === 'COMPLETED').length;
    
    const patientIds = new Set(allApps.map(a => a.patientId));
    const totalPatients = patientIds.size;
    
    res.json({
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalPatients
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get doctor's patients
router.get('/patients', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    
    // Get distinct patient IDs from appointments
    const apps = await db.select({ patientId: appointments.patientId }).from(appointments).where(eq(appointments.doctorId, doctorRes[0].id));
    const patientIds = [...new Set(apps.map(a => a.patientId))];
    
    if (patientIds.length === 0) return res.json([]);
    
    const patients = await db.select().from(users).where(inArray(users.id, patientIds));
    
    // Enrich with appointment stats
    const enrichedPatients = await Promise.all(patients.map(async p => {
      const pApps = await db.select().from(appointments)
        .where(and(eq(appointments.patientId, p.id), eq(appointments.doctorId, doctorRes[0].id)))
        .orderBy(desc(appointments.date), desc(appointments.startTime));
      return {
        ...p,
        appointmentsCount: pApps.length,
        lastVisit: pApps.length > 0 ? pApps[0].date : null
      };
    }));
    
    res.json(enrichedPatients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient details and history
router.get('/patients/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    
    // Verify relationship
    const relation = await db.select().from(appointments).where(and(eq(appointments.patientId, patientId), eq(appointments.doctorId, doctorRes[0].id))).limit(1);
    if (relation.length === 0) return res.status(403).json({ error: 'Forbidden' });
    
    const patient = await db.select().from(users).where(eq(users.id, patientId)).limit(1);
    
    const appts = await db.select().from(appointments)
      .where(and(eq(appointments.patientId, patientId), eq(appointments.doctorId, doctorRes[0].id)))
      .orderBy(desc(appointments.date), desc(appointments.startTime));
      
    // Fetch prescriptions for these appointments
    const apptIds = appts.map(a => a.id);
    let prescs = [];
    if (apptIds.length > 0) {
      prescs = await db.select().from(prescriptions).where(inArray(prescriptions.appointmentId, apptIds));
    }
    
    res.json({
      patient: patient[0],
      appointments: appts,
      prescriptions: prescs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

// Save consultation
router.post('/appointments/:id/consultation', requireAuth, async (req: AuthRequest, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { symptoms, diagnosis, notes, temperature, bloodPressure, heartRate, spo2 } = req.body;
    
    const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    
    // Verify ownership
    const appt = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
    if (appt.length === 0 || appt[0].doctorId !== doctorRes[0].id) return res.status(403).json({ error: 'Forbidden' });
    
    await db.update(appointments).set({
      symptoms,
      diagnosis,
      notes,
      temperature,
      bloodPressure,
      heartRate,
      spo2
    }).where(eq(appointments.id, appointmentId));
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save consultation' });
  }
});

// Save prescription
router.post('/appointments/:id/prescriptions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { medicines } = req.body; // Array of medicines
    
    const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    
    // Verify ownership
    const appt = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
    if (appt.length === 0 || appt[0].doctorId !== doctorRes[0].id) return res.status(403).json({ error: 'Forbidden' });
    
    for (const med of medicines) {
      await db.insert(prescriptions).values({
        appointmentId,
        medicine: med.medicine,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || ''
      });
    }
    
    // Mark appointment as completed
    await db.update(appointments).set({ status: 'COMPLETED' }).where(eq(appointments.id, appointmentId));
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save prescription' });
  }
});

// Get doctor's prescriptions
router.get('/prescriptions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userRes = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRes.length === 0 || userRes[0].role !== 'DOCTOR' || userRes[0].status !== 'ACTIVE') return res.status(403).json({ error: 'Forbidden' });
    
    const doctorRes = await db.select().from(doctors).where(eq(doctors.userId, userRes[0].id)).limit(1);
    
    const allApps = await db.select().from(appointments).where(eq(appointments.doctorId, doctorRes[0].id));
    const apptIds = allApps.map(a => a.id);
    
    if (apptIds.length === 0) return res.json([]);
    
    const prescs = await db.select({
      id: prescriptions.id,
      medicine: prescriptions.medicine,
      dosage: prescriptions.dosage,
      frequency: prescriptions.frequency,
      duration: prescriptions.duration,
      instructions: prescriptions.instructions,
      appointmentId: prescriptions.appointmentId,
      createdAt: prescriptions.createdAt,
      patientName: users.name,
      patientId: users.id,
      appointmentDate: appointments.date
    }).from(prescriptions)
      .innerJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .innerJoin(users, eq(appointments.patientId, users.id))
      .where(inArray(prescriptions.appointmentId, apptIds))
      .orderBy(desc(prescriptions.createdAt));
      
    res.json(prescs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

export default router;
