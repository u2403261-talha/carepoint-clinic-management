/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import PatientLayout from './components/patient/PatientLayout';
import DoctorDashboard from './components/doctor/DoctorLayout';
import AdminDashboard from './components/AdminDashboard';

import PendingApprovalPage from './components/PendingApprovalPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfUsePage from './components/TermsOfUsePage';
import CopyrightPage from './components/CopyrightPage';
import HelpSupportPage from './components/HelpSupportPage';
import FeedbackPage from './components/FeedbackPage';


const RoleGuard = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="animate-pulse text-2xl font-display text-primary">LOADING...</div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return <Navigate to={`/${allowedRole.toLowerCase()}/login`} replace />;
  }

  if (profile.role !== allowedRole) {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] max-w-md w-full">
          <h1 className="font-display text-3xl uppercase text-primary mb-4">Access Denied</h1>
          <p className="text-primary/70 mb-8">
            This account is not registered as a {allowedRole.toLowerCase()}. Please use the correct login portal.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-3 w-full bg-primary text-white font-bold uppercase tracking-wide hover:bg-secondary transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  if (allowedRole === 'DOCTOR' && profile.status === 'PENDING') {
    return <Navigate to="/doctor/pending-approval" replace />;
  }

  if (profile.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] max-w-md w-full">
          <h1 className="font-display text-3xl uppercase text-primary mb-4">Access Denied</h1>
          <p className="text-primary/70 mb-8">
            Your account is not active.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-3 w-full bg-primary text-white font-bold uppercase tracking-wide hover:bg-secondary transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/patient/login" element={<LoginPage type="PATIENT" />} />
          <Route path="/patient/register" element={<RegisterPage role="PATIENT" />} />
          
          <Route path="/doctor/login" element={<LoginPage type="DOCTOR" />} />
          <Route path="/doctor/register" element={<RegisterPage role="DOCTOR" />} />
          <Route path="/doctor/pending-approval" element={<PendingApprovalPage />} />
          
          <Route path="/admin/login" element={<LoginPage type="ADMIN" />} />
          
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/copyright" element={<CopyrightPage />} />
          <Route path="/help-support" element={<HelpSupportPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />

          
          <Route path="/patient/*" element={
            <RoleGuard allowedRole="PATIENT">
              <PatientLayout />
            </RoleGuard>
          } />
          
          <Route path="/doctor/*" element={
            <RoleGuard allowedRole="DOCTOR">
              <DoctorDashboard />
            </RoleGuard>
          } />
          
          <Route path="/admin/*" element={
            <RoleGuard allowedRole="ADMIN">
              <AdminDashboard />
            </RoleGuard>
          } />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
