import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorProfileManager from './DoctorProfileManager';

interface DoctorSettingsProps {
  tab?: 'profile' | 'settings';
}

export default function DoctorSettings({ tab = 'settings' }: DoctorSettingsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 border-b-2 border-primary pb-2 mb-6">
        <button 
          onClick={() => navigate('/doctor/profile')}
          className={`font-display text-2xl uppercase ${tab === 'profile' ? 'text-primary' : 'text-primary/40 hover:text-primary/70'}`}
        >
          My Profile
        </button>
        <span className="text-primary/20 text-2xl">|</span>
        <button 
          onClick={() => navigate('/doctor/settings')}
          className={`font-display text-2xl uppercase ${tab === 'settings' ? 'text-primary' : 'text-primary/40 hover:text-primary/70'}`}
        >
          Account Settings
        </button>
      </div>

      <DoctorProfileManager activeTab={tab} />
    </div>
  );
}
