import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Calendar, Search, Pill, Settings, LogOut, Menu, X, User } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Footer } from '../ui/Footer';

import PatientAppointments from './PatientAppointments';
import PatientBook from './PatientBook';
import PatientPrescriptions from './PatientPrescriptions';
import PatientSettings from './PatientSettings';

export default function PatientLayout() {
  const { profile, logOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Appointments', path: '/patient/dashboard', icon: Calendar },
    { name: 'Book Doctor', path: '/patient/book', icon: Search },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
    { name: 'Profile', path: '/patient/profile', icon: User },
    { name: 'Settings', path: '/patient/settings', icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center z-20">
        <Logo size="sm" variant="light" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-primary text-white flex-shrink-0 z-10 md:min-h-screen flex flex-col border-r border-primary/10 transition-all duration-300`}>
        <div className="p-6 hidden md:flex border-b border-white/10">
          <Logo size="md" variant="light" />
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 font-medium transition-colors ${isActive ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <div className="mb-4 font-medium truncate text-white/70">{profile?.name}</div>
          <button onClick={logOut} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-full text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/dashboard" element={<PatientAppointments />} />
          <Route path="/book" element={<PatientBook />} />
          <Route path="/prescriptions" element={<PatientPrescriptions />} />
          <Route path="/profile" element={<PatientSettings tab="profile" />} />
          <Route path="/settings" element={<PatientSettings tab="settings" />} />
        </Routes>
        <div className="mt-16 -mx-4 md:-mx-8 -mb-4 md:-mb-8">
          <Footer />
        </div>
      </main>
    </div>
  );
}
