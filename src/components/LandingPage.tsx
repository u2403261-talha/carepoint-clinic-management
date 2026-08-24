import { Logo } from './ui/Logo';
import { Footer } from './ui/Footer';
import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, UserPlus, FileText, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user && profile) {
      if (profile.role === 'PATIENT') navigate('/patient/dashboard');
      else if (profile.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (profile.role === 'ADMIN') navigate('/admin/dashboard');
    } else {
      navigate('/patient/login');
    }
  };

  return (
    <div className="min-h-screen bg-light text-primary selection:bg-accent selection:text-primary">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-primary/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex gap-8 font-medium">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors">How it Works</a>
          </div>
          <button 
            onClick={handleCTA}
            className="px-6 py-2.5 bg-primary text-white font-medium hover:bg-secondary transition-colors"
          >
            {user ? 'Go to Dashboard' : 'Login / Register'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 bg-sage/20 text-primary font-medium text-sm tracking-wider uppercase">
              The New Standard in Healthcare
            </div>
            
            <h1 className="font-display text-7xl md:text-8xl leading-[0.9] uppercase">
              Modern<br />
              Healthcare.<br />
              <span className="bg-accent px-2">Without</span><br />
              The Wait.
            </h1>
            
            <p className="text-xl text-primary/70 max-w-md font-medium leading-relaxed">
              Book appointments instantly, manage your health records, and connect with top doctors. Skip the waiting room.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  localStorage.setItem('onboarding_intent', 'patient');
                  if (user && profile) {
                    if (profile.role === 'PATIENT') navigate('/patient/dashboard');
                    else if (profile.role === 'DOCTOR') navigate('/doctor/dashboard');
                    else if (profile.role === 'ADMIN') navigate('/admin/dashboard');
                  } else {
                    navigate('/patient/register');
                  }
                }}
                className="px-8 py-4 bg-primary text-white font-bold tracking-wide flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-95"
              >
                BOOK AN APPOINTMENT <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('onboarding_intent', 'doctor');
                  if (user && profile) {
                    if (profile.role === 'PATIENT') navigate('/patient/dashboard');
                    else if (profile.role === 'DOCTOR') navigate('/doctor/dashboard');
                    else if (profile.role === 'ADMIN') navigate('/admin/dashboard');
                  } else {
                    navigate('/doctor/register');
                  }
                }}
                className="px-8 py-4 bg-white border-2 border-primary text-primary font-bold tracking-wide flex items-center justify-center gap-3 hover:bg-sage/10 transition-all active:scale-95"
              >
                JOIN AS A DOCTOR
              </button>
            </div>
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="bg-white p-6 border-2 border-primary/5 shadow-[8px_8px_0px_0px_rgba(23,30,25,0.1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
              <div className="text-5xl font-display mb-2">10k+</div>
              <div className="font-medium text-primary/70">Patients Served</div>
            </div>
            <div className="bg-accent p-6 border-2 border-primary mt-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
              <div className="text-5xl font-display mb-2">50+</div>
              <div className="font-medium text-primary/90">Specialist Doctors</div>
            </div>
            <div className="bg-sage p-6 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
              <div className="text-5xl font-display mb-2">15</div>
              <div className="font-medium text-primary/90">Clinic Departments</div>
            </div>
            <div className="bg-white p-6 border-2 border-primary/5 mt-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,0.1)]">
              <div className="text-5xl font-display mb-2">4.9</div>
              <div className="font-medium text-primary/70">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section id="features" className="py-24 bg-primary text-white px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="font-display text-4xl text-white/50">THE OLD WAY</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center gap-4 text-white/50 opacity-80"><div className="w-2 h-2 bg-white/20 rounded-full"></div> Phone calls on hold</li>
              <li className="flex items-center gap-4 text-white/50 opacity-80"><div className="w-2 h-2 bg-white/20 rounded-full"></div> Manual scheduling errors</li>
              <li className="flex items-center gap-4 text-white/50 opacity-80"><div className="w-2 h-2 bg-white/20 rounded-full"></div> Long waiting room times</li>
              <li className="flex items-center gap-4 text-white/50 opacity-80"><div className="w-2 h-2 bg-white/20 rounded-full"></div> Lost paper records</li>
            </ul>
          </div>
          
          <div className="space-y-8">
            <h2 className="font-display text-4xl text-accent">THE CAREPOINT WAY</h2>
            <ul className="space-y-6 text-xl">
              <li className="flex items-center gap-4"><CheckCircle2 className="text-accent" /> 24/7 Online Booking</li>
              <li className="flex items-center gap-4"><CheckCircle2 className="text-accent" /> Real-time availability</li>
              <li className="flex items-center gap-4"><CheckCircle2 className="text-accent" /> Organized appointments</li>
              <li className="flex items-center gap-4"><CheckCircle2 className="text-accent" /> Digital health records</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-display text-5xl md:text-6xl uppercase">Everything you need</h2>
            <p className="text-xl text-primary/70 max-w-2xl mx-auto">A complete toolkit for modern clinics and their patients.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-light p-10 border-2 border-primary/5 hover:border-accent transition-colors group">
              <Calendar className="w-12 h-12 mb-6 text-primary group-hover:text-accent transition-colors" />
              <h3 className="font-display text-3xl mb-4 uppercase">Smart Scheduling</h3>
              <p className="text-lg text-primary/70">Find the right doctor and book instantly. No conflicts, no double bookings. See availability in real-time.</p>
            </div>
            
            <div className="bg-primary text-white p-10 border-2 border-primary hover:bg-secondary transition-colors">
              <UserPlus className="w-12 h-12 mb-6 text-accent" />
              <h3 className="font-display text-3xl mb-4 text-accent uppercase">Role Dashboards</h3>
              <p className="text-white/70">Dedicated interfaces for Patients, Doctors, and Clinic Admins.</p>
            </div>

            <div className="bg-sage p-10 border-2 border-primary hover:bg-[#A5B5B0] transition-colors">
              <FileText className="w-12 h-12 mb-6 text-primary" />
              <h3 className="font-display text-3xl mb-4 uppercase">Digital Prescriptions</h3>
              <p className="text-primary/80">Access your consultation notes and prescriptions anytime, anywhere.</p>
            </div>

            <div className="md:col-span-2 bg-accent p-10 border-2 border-primary">
              <div className="text-6xl font-display opacity-20 mb-4">010110</div>
              <h3 className="font-display text-3xl mb-4 uppercase">Clinic Analytics</h3>
              <p className="text-lg text-primary/80">Administrators get bird's-eye views of clinic performance, doctor activity, and patient flow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-light">
        <div className="max-w-7xl mx-auto space-y-16">
          <h2 className="font-display text-5xl md:text-6xl text-center uppercase">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative group p-8 border-2 border-transparent hover:border-primary/10 transition-colors bg-white">
              <div className="absolute top-4 right-4 text-8xl font-display text-primary/[0.03] group-hover:text-accent/20 transition-colors">01</div>
              <h3 className="font-display text-3xl mt-12 mb-4 uppercase">Find Your Doctor</h3>
              <p className="text-primary/70 text-lg relative z-10">Search by department, specialization, and availability to find the perfect match for your needs.</p>
            </div>
            
            <div className="relative group p-8 border-2 border-transparent hover:border-primary/10 transition-colors bg-white">
              <div className="absolute top-4 right-4 text-8xl font-display text-primary/[0.03] group-hover:text-accent/20 transition-colors">02</div>
              <h3 className="font-display text-3xl mt-12 mb-4 uppercase">Book Your Time</h3>
              <p className="text-primary/70 text-lg relative z-10">Select an open slot from the doctor's real-time calendar and secure your appointment instantly.</p>
            </div>
            
            <div className="relative group p-8 border-2 border-transparent hover:border-primary/10 transition-colors bg-white">
              <div className="absolute top-4 right-4 text-8xl font-display text-primary/[0.03] group-hover:text-accent/20 transition-colors">03</div>
              <h3 className="font-display text-3xl mt-12 mb-4 uppercase">Show Up. Get Care.</h3>
              <p className="text-primary/70 text-lg relative z-10">Use your digital QR ticket at the clinic. View your prescriptions online after the visit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-accent border-t-2 border-primary text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="font-display text-6xl md:text-8xl uppercase leading-none">
            Your Next<br />
            Appointment<br />
            Starts Here.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                localStorage.setItem('onboarding_intent', 'patient');
                if (user && profile) {
                  if (profile.role === 'PATIENT') navigate('/patient/dashboard');
                  else if (profile.role === 'DOCTOR') navigate('/doctor/dashboard');
                  else if (profile.role === 'ADMIN') navigate('/admin/dashboard');
                } else {
                  navigate('/patient/register');
                }
              }}
              className="px-8 py-5 bg-primary text-white font-bold tracking-wide flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-95 text-lg"
            >
              BOOK AN APPOINTMENT <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
