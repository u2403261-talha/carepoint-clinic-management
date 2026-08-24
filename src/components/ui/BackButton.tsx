import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface BackButtonProps {
  fallback?: string;
  className?: string;
  label?: string;
}

export default function BackButton({ fallback, className = "flex items-center gap-2 font-bold uppercase text-primary hover:text-primary/70 transition-colors mb-6", label = "Back" }: BackButtonProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const location = useLocation();
  
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      let defaultFallback = '/';
      if (profile?.role === 'PATIENT') defaultFallback = '/patient/dashboard';
      else if (profile?.role === 'DOCTOR') defaultFallback = '/doctor/dashboard';
      else if (profile?.role === 'ADMIN') defaultFallback = '/admin/dashboard';
      
      navigate(fallback || defaultFallback, { replace: true });
    }
  };

  return (
    <button onClick={handleBack} className={className}>
      <ArrowLeft className="w-5 h-5" /> {label}
    </button>
  );
}
