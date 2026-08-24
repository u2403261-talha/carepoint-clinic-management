import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 px-6 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Logo size="md" variant="light" className="mb-4" />
            <div className="text-sm text-white/70">
              Clinic Appointment Management System
            </div>
            <div className="text-sm text-white/70 mt-2">
              A modern platform connecting patients, doctors, and clinic administrators.
            </div>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-accent mb-6">Product</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><a href="/#features" className="hover:text-white transition-colors">About</a></li>
              <li><Link to="/help-support" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/patient/login" className="hover:text-white transition-colors">Patient Login</Link></li>
              <li><Link to="/doctor/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-accent mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/copyright" className="hover:text-white transition-colors">Copyright</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-accent mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/help-support" className="hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/50">
          &copy; 2026 CarePoint. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
