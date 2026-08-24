import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteAccountSection from '../DeleteAccountSection';
import ChangePasswordSection from '../ChangePasswordSection';
import PatientProfile from './PatientProfile';

interface PatientSettingsProps {
  tab: 'profile' | 'settings';
}

export default function PatientSettings({ tab }: PatientSettingsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b-2 border-primary pb-2 mb-6">
        <button 
          onClick={() => navigate('/patient/profile')}
          className={`font-display text-2xl uppercase ${tab === 'profile' ? 'text-primary' : 'text-primary/40 hover:text-primary/70'}`}
        >
          My Profile
        </button>
        <span className="text-primary/20 text-2xl">|</span>
        <button 
          onClick={() => navigate('/patient/settings')}
          className={`font-display text-2xl uppercase ${tab === 'settings' ? 'text-primary' : 'text-primary/40 hover:text-primary/70'}`}
        >
          Account Settings
        </button>
      </div>

      {tab === 'profile' ? (
        <PatientProfile />
      ) : (
        <div>
          <ChangePasswordSection />
          <DeleteAccountSection />
        </div>
      )}
    </div>
  );
}
