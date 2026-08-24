import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';
import { Footer } from './ui/Footer';
import BackButton from './ui/BackButton';

export default function PrivacyPolicyPage() {
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
          <h1 className="font-display text-4xl uppercase mb-8 border-b-2 border-primary/10 pb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg text-primary max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-primary">
            <p className="font-bold mb-8">Last Updated: August 2026</p>

            <p>CarePoint ("we", "our", or "the platform") is a clinic appointment management system designed to help patients, doctors, and administrators manage appointments and related information.</p>

            <h3 className="text-2xl mt-8 mb-4">Information We Collect</h3>
            <p>Depending on how you use CarePoint, we may collect:</p>
            
            <p className="font-bold mt-4">Patient information</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Date of birth and gender where provided</li>
              <li>Appointment information</li>
              <li>Prescription and consultation information where applicable</li>
            </ul>

            <p className="font-bold mt-4">Doctor information</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Qualification</li>
              <li>Specialization</li>
              <li>Department</li>
              <li>Experience</li>
              <li>Registration number</li>
              <li>Professional profile information</li>
            </ul>

            <p className="font-bold mt-4">Account information</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Login credentials handled through our authentication provider</li>
              <li>User role</li>
              <li>Account status</li>
              <li>Account creation and account-related timestamps</li>
            </ul>

            <h3 className="text-2xl mt-8 mb-4">How We Use Information</h3>
            <p>Information may be used to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Create and manage user accounts</li>
              <li>Allow patients to find doctors</li>
              <li>Schedule and manage appointments</li>
              <li>Allow doctors to manage appointments</li>
              <li>Maintain consultation and prescription records</li>
              <li>Provide account and customer support</li>
              <li>Maintain security and prevent unauthorized access</li>
              <li>Improve the functionality of the platform</li>
            </ul>

            <h3 className="text-2xl mt-8 mb-4">Authentication and Security</h3>
            <p>CarePoint uses authentication and database services to manage accounts and application data.</p>
            <p>Passwords are handled through the authentication system and are not intentionally stored as plain text in the application's database.</p>
            <p>We use reasonable technical measures to protect user information. However, no online system can guarantee complete security.</p>

            <h3 className="text-2xl mt-8 mb-4">Sharing of Information</h3>
            <p>We do not intentionally sell personal information to third parties.</p>
            <p>Information may be accessible to authorized users where necessary for the operation of the platform. For example, information required for an appointment may be accessible to the relevant patient, doctor, or authorized administrator.</p>

            <h3 className="text-2xl mt-8 mb-4">Medical Information</h3>
            <p>CarePoint is a software platform for managing clinic appointments and related information.</p>
            <p>It does not independently provide medical advice or diagnosis.</p>
            <p>Users should not rely on the platform itself as a substitute for professional medical advice.</p>

            <h3 className="text-2xl mt-8 mb-4">Data Retention</h3>
            <p>Information may be retained for as long as necessary to operate the platform, maintain appointment and administrative records, comply with applicable requirements, or resolve disputes.</p>
            <p>Deleted accounts may retain limited administrative records where necessary for security, auditing, or legitimate operational purposes.</p>

            <h3 className="text-2xl mt-8 mb-4">Account Deletion</h3>
            <p>Users may request or initiate deletion of their account where the functionality is available.</p>
            <p>Some records may need to be retained where necessary for legitimate operational, security, legal, or record-keeping purposes.</p>

            <h3 className="text-2xl mt-8 mb-4">Third-Party Services</h3>
            <p>CarePoint may use third-party services such as authentication, hosting, database, analytics, or other infrastructure providers.</p>
            <p>These services may process information as necessary to provide their respective services.</p>

            <h3 className="text-2xl mt-8 mb-4">Changes to This Policy</h3>
            <p>This Privacy Policy may be updated when the platform's features, services, or legal requirements change.</p>
            <p>The updated version will be posted on this page.</p>

            <h3 className="text-2xl mt-8 mb-4">Contact</h3>
            <p>For privacy-related questions, please contact the CarePoint administrator through the Help & Support section.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
