import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PendingApprovalPage() {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    await logOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] max-w-md w-full">
        <h1 className="font-display text-3xl uppercase text-primary mb-4">Pending Approval</h1>
        <p className="text-primary/70 mb-8">
          Your doctor account is awaiting administrator approval.
        </p>
        <button 
          onClick={handleLogOut} 
          className="px-6 py-3 w-full bg-primary text-white font-bold uppercase tracking-wide hover:bg-secondary transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
