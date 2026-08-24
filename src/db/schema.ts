import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('PATIENT'), // PATIENT, DOCTOR, ADMIN
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PENDING, SUSPENDED
  dob: text('dob'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  specialization: text('specialization').notNull(),
  qualification: text('qualification').notNull(),
  experience: integer('experience').notNull(), // years
  registrationNumber: text('registration_number').notNull(),
  bio: text('bio'),
  // Schedule config
  workingDays: text('working_days'), // e.g., "Monday,Tuesday"
  startTime: text('start_time'), // e.g., "09:00"
  endTime: text('end_time'), // e.g., "17:00"
  slotDuration: integer('slot_duration').default(20), // minutes
  blockedDates: text('blocked_dates'), // comma-separated dates "YYYY-MM-DD,YYYY-MM-DD"
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => users.id).notNull(),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:mm
  status: text('status').notNull().default('PENDING'), // PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED
  reason: text('reason'),
  
  // Consultation records
  symptoms: text('symptoms'),
  diagnosis: text('diagnosis'),
  notes: text('notes'),
  recommendations: text('recommendations'),
  temperature: text('temperature'),
  bloodPressure: text('blood_pressure'),
  heartRate: text('heart_rate'),
  spo2: text('spo2'),
  
  ticketId: text('ticket_id').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  uniqueSlot: unique('unique_appointment_slot').on(t.doctorId, t.date, t.startTime)
}));

export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').references(() => appointments.id).notNull(),
  medicine: text('medicine').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  duration: text('duration').notNull(),
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deletedAccounts = pgTable('deleted_accounts', {
  id: serial('id').primaryKey(),
  originalUid: text('original_uid').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  registeredAt: timestamp('registered_at'),
  deletedAt: timestamp('deleted_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  doctorProfile: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  appointmentsAsPatient: many(appointments, { relationName: 'patientAppointments' }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  doctors: many(doctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  appointments: many(appointments, { relationName: 'doctorAppointments' }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
    relationName: 'patientAppointments',
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
    relationName: 'doctorAppointments',
  }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  appointment: one(appointments, {
    fields: [prescriptions.appointmentId],
    references: [appointments.id],
  }),
}));
