import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import { LayoutDashboard, Calendar, Clock, Users, Pill, BarChart3, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Footer } from '../ui/Footer';
import DoctorDashboard from './DoctorDashboardOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorSchedule from './DoctorSchedule';
import DoctorPatients from './DoctorPatients';
import DoctorPatientProfile from './DoctorPatientProfile';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorAnalytics from './DoctorAnalytics';
import DoctorProfile from './DoctorProfile';
import DoctorSettings from './DoctorSettings';
import DoctorAppointmentDetails from './DoctorAppointmentDetails';

export default function DoctorLayout() {
  const { logOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Schedule', path: '/doctor/schedule', icon: Clock },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
    { name: 'Analytics', path: '/doctor/analytics', icon: BarChart3 },
  ];

  const bottomNavItems = [
    { name: 'Profile', path: '/doctor/profile', icon: User },
    { name: 'Settings', path: '/doctor/settings', icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary text-light p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2"><Logo size="sm" variant="light" iconOnly /><span className="font-display text-xl uppercase tracking-widest text-white">Doctor</span></div>
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-primary text-light flex-shrink-0 z-10 md:min-h-screen flex flex-col transition-all duration-300`}>
        <div className="p-6 hidden md:flex justify-between items-center">
          <div className="flex items-center gap-2"><Logo size="md" variant="light" iconOnly /><span className="font-display text-xl uppercase tracking-widest text-white">Doctor</span></div>
          <NotificationsDropdown />
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-2 px-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm transition-colors ${isActive ? 'bg-accent text-primary' : 'hover:bg-primary/80 hover:text-accent'}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-light/20 flex flex-col gap-2">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm transition-colors ${isActive ? 'bg-accent text-primary' : 'hover:bg-primary/80 hover:text-accent'}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <button 
            onClick={logOut}
            className="flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/appointments" element={<DoctorAppointments />} />
          <Route path="/appointments/:id" element={<DoctorAppointmentDetails />} />
          <Route path="/schedule" element={<DoctorSchedule />} />
          <Route path="/patients" element={<DoctorPatients />} />
          <Route path="/patients/:id" element={<DoctorPatientProfile />} />
          <Route path="/prescriptions" element={<DoctorPrescriptions />} />
          <Route path="/analytics" element={<DoctorAnalytics />} />
          <Route path="/profile" element={<DoctorSettings tab="profile" />} />
          <Route path="/settings" element={<DoctorSettings tab="settings" />} />
        </Routes>
      </main>
    </div>
  );
}
