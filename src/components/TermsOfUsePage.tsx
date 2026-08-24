import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';
import { Footer } from './ui/Footer';
import BackButton from './ui/BackButton';

export default function TermsOfUsePage() {
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
          <h1 className="font-display text-4xl uppercase mb-8 border-b-2 border-primary/10 pb-6">Terms of Use</h1>
          
          <div className="prose prose-lg text-primary max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-primary">
            <p className="font-bold mb-8">Last Updated: August 2026</p>

            <p>By accessing or using CarePoint, you agree to these Terms of Use.</p>

            <h3 className="text-2xl mt-8 mb-4">Use of the Platform</h3>
            <p>CarePoint provides software for managing clinic appointments, doctor schedules, patient information, consultations, and related administrative activities.</p>
            <p>Users must provide accurate information when creating an account.</p>

            <h3 className="text-2xl mt-8 mb-4">Patient Responsibilities</h3>
            <p>Patients are responsible for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Providing accurate information</li>
              <li>Keeping their login credentials secure</li>
              <li>Attending appointments they book</li>
              <li>Cancelling appointments when necessary</li>
              <li>Using the platform only for legitimate purposes</li>
            </ul>

            <h3 className="text-2xl mt-8 mb-4">Doctor Responsibilities</h3>
            <p>Doctors are responsible for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Providing accurate professional information</li>
              <li>Keeping their account secure</li>
              <li>Managing appointments responsibly</li>
              <li>Entering accurate consultation and prescription information</li>
              <li>Using patient information only for appropriate purposes</li>
            </ul>

            <h3 className="text-2xl mt-8 mb-4">Administrator Responsibilities</h3>
            <p>Administrators are responsible for managing the platform, approving doctor accounts where applicable, and maintaining appropriate access controls.</p>

            <h3 className="text-2xl mt-8 mb-4">Prohibited Activities</h3>
            <p>Users must not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Attempt to access another user's account</li>
              <li>Attempt to bypass authentication or authorization</li>
              <li>Modify another user's information without permission</li>
              <li>Attempt to gain unauthorized administrative access</li>
              <li>Upload malicious content</li>
              <li>Abuse or disrupt the platform</li>
              <li>Use the platform for unlawful activities</li>
            </ul>

            <h3 className="text-2xl mt-8 mb-4">Medical Disclaimer</h3>
            <p>CarePoint is an appointment and clinic management platform.</p>
            <p>CarePoint does not provide medical diagnosis or treatment itself.</p>
            <p>Medical decisions remain the responsibility of qualified healthcare professionals.</p>

            <h3 className="text-2xl mt-8 mb-4">Availability</h3>
            <p>We aim to keep CarePoint available and functional, but we do not guarantee uninterrupted availability.</p>
            <p>The platform may occasionally be unavailable because of maintenance, technical problems, third-party service failures, or other circumstances.</p>

            <h3 className="text-2xl mt-8 mb-4">Account Suspension or Termination</h3>
            <p>Accounts may be suspended or terminated when necessary to protect the platform, users, or data, or when users violate these Terms.</p>

            <h3 className="text-2xl mt-8 mb-4">Changes to These Terms</h3>
            <p>These Terms may be updated as the platform develops.</p>
            <p>Continued use of CarePoint after changes are published constitutes acceptance of the updated Terms where applicable.</p>

            <h3 className="text-2xl mt-8 mb-4">Contact</h3>
            <p>For questions about these Terms, contact the CarePoint administrator through Help & Support.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
