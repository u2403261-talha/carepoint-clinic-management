/// <reference types="vite/client" />
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';
import { Footer } from './ui/Footer';
import BackButton from './ui/BackButton';

export default function HelpSupportPage() {
  return (
    <div className="min-h-screen bg-light flex flex-col">
      <nav className="relative z-50 border-b border-primary/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-4">
             <BackButton className="font-bold uppercase text-primary hover:text-primary/70 transition-colors" />
          </div>
        </div>
      </nav>

      <main className="flex-1 py-16 px-6">
        <div className="max-w-3xl mx-auto bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
          <h1 className="font-display text-4xl uppercase mb-8 border-b-2 border-primary/10 pb-6">Help & Support</h1>
          
          <div className="prose prose-lg text-primary max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-primary">
            <p className="font-bold mb-8">Need help using CarePoint?</p>

            <h3 className="text-2xl mt-8 mb-4">Patients</h3>
            <p>For problems with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Registration</li>
              <li>Login</li>
              <li>Forgot password</li>
              <li>Finding doctors</li>
              <li>Booking appointments</li>
              <li>Viewing appointments</li>
              <li>Viewing prescriptions</li>
              <li>Updating your profile</li>
            </ul>
            <p>First check that your account information is correct and that you are using the correct Patient Login.</p>

            <h3 className="text-2xl mt-8 mb-4">Doctors</h3>
            <p>For problems with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Doctor registration</li>
              <li>Account approval</li>
              <li>Login</li>
              <li>Managing appointments</li>
              <li>Creating schedules</li>
              <li>Patient information</li>
              <li>Consultations</li>
              <li>Prescriptions</li>
              <li>Profile updates</li>
            </ul>
            <p>Make sure your doctor account has been approved by an administrator.</p>

            <h3 className="text-2xl mt-8 mb-4">Account Problems</h3>
            <p>If you cannot log in:</p>
            <ol className="list-decimal pl-6 mb-4">
              <li>Check your email and password.</li>
              <li>Use Forgot Password.</li>
              <li>Make sure you are using the correct Patient or Doctor login.</li>
              <li>Contact support if the problem continues.</li>
            </ol>

            <h3 className="text-2xl mt-8 mb-4">Security Problems</h3>
            <p>If you believe someone has accessed your account without permission, change your password immediately and contact the administrator.</p>

            <h3 className="text-2xl mt-8 mb-4">Contact Support</h3>
            <p><strong>Email:</strong> {import.meta.env.VITE_SUPPORT_EMAIL || 'support@carepoint-clinic.com'}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
