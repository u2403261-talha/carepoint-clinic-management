CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"doctor_id" integer NOT NULL,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reason" text,
	"symptoms" text,
	"diagnosis" text,
	"notes" text,
	"recommendations" text,
	"temperature" text,
	"blood_pressure" text,
	"heart_rate" text,
	"spo2" text,
	"ticket_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "appointments_ticket_id_unique" UNIQUE("ticket_id"),
	CONSTRAINT "unique_appointment_slot" UNIQUE("doctor_id","date","start_time")
);
--> statement-breakpoint
CREATE TABLE "deleted_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_uid" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"registered_at" timestamp,
	"deleted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"department_id" integer,
	"specialization" text NOT NULL,
	"qualification" text NOT NULL,
	"experience" integer NOT NULL,
	"registration_number" text NOT NULL,
	"bio" text,
	"working_days" text,
	"start_time" text,
	"end_time" text,
	"slot_duration" integer DEFAULT 20,
	"blocked_dates" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"medicine" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"duration" text NOT NULL,
	"instructions" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'PATIENT' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"dob" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;