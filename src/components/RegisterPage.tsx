import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BackButton from './ui/BackButton';
import { Logo } from './ui/Logo';
import { useAuth } from './AuthContext';

export default function RegisterPage({ role = 'PATIENT' }: { role?: 'PATIENT' | 'DOCTOR' }) {
  const { user, profile, signIn, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor fields
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (role === 'DOCTOR') {
      fetch('/api/departments').then(res => res.json()).then(setDepartments);
    }
  }, [role]);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'PATIENT') navigate('/patient/dashboard');
      else if (profile.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (profile.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [user, profile, navigate]);

  const handleGoogleSignIn = async () => {
    if (role === 'DOCTOR' && (!specialization || !departmentId || !qualification || !experience || !registrationNumber)) {
      alert('Please fill out all doctor specific fields before signing in with Google.');
      return;
    }
    try {
      setLoading(true);
      sessionStorage.setItem('doctor_registration_data', JSON.stringify({
        specialization, departmentId, qualification, experience, registrationNumber
      }));
      await signIn(role);
      setLoading(false);
    } catch (e) {
      if (e.code !== "auth/email-already-in-use" && e.code !== "auth/invalid-credential" && e.code !== "auth/user-not-found" && e.code !== "auth/network-request-failed" && e.code !== "auth/internal-error") console.error(e);
      if (e.code === 'auth/email-already-in-use' || e.message?.includes('email-already-in-use')) {
        alert('This email is already registered. Please log in.');
      } else if (e.code === 'auth/invalid-credential' || e.message?.includes('invalid-credential')) {
        alert('Invalid email or password. Please try again.');
      } else if (e.code === 'auth/user-not-found' || e.message?.includes('user-not-found')) {
        alert('No user found with this email. Please register first.');
      } else if (e.code === 'auth/network-request-failed' || e.code === 'auth/internal-error' || e.message?.includes('network-request-failed') || e.message?.includes('internal-error')) {
        alert('Network or Internal Error. If you are using Google Sign-In, please open the app in a new tab (using the button at the top right) due to iframe restrictions. Otherwise, check your credentials.');
      } else {
        alert(e.message?.replace('Firebase: ', '') || 'Failed to register');
      }
      setLoading(false);
    }
  };
  
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (role === 'DOCTOR' && (!specialization || !departmentId || !qualification || !experience || !registrationNumber)) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      setLoading(true);
      sessionStorage.setItem('doctor_registration_data', JSON.stringify({
        specialization, departmentId, qualification, experience, registrationNumber
      }));
      const newProfile = await registerWithEmail(email, password, name, role);
      if (newProfile) {
        if (newProfile.role === 'PATIENT') {
          navigate('/patient/dashboard');
        } else if (newProfile.role === 'DOCTOR') {
          if (newProfile.status === 'PENDING') {
            navigate('/doctor/pending-approval');
          } else {
            navigate('/doctor/dashboard');
          }
        } else if (newProfile.role === 'ADMIN') {
          navigate('/admin/dashboard');
        }
      }
      setLoading(false);
    } catch (e: any) {
      if (e.code !== "auth/email-already-in-use" && e.code !== "auth/invalid-credential" && e.code !== "auth/user-not-found" && e.code !== "auth/network-request-failed" && e.code !== "auth/internal-error") console.error(e);
      if (e.code === 'auth/email-already-in-use' || e.message?.includes('email-already-in-use')) {
        alert('This email is already registered. Please log in.');
      } else if (e.code === 'auth/invalid-credential' || e.message?.includes('invalid-credential')) {
        alert('Invalid email or password. Please try again.');
      } else if (e.code === 'auth/user-not-found' || e.message?.includes('user-not-found')) {
        alert('No user found with this email. Please register first.');
      } else if (e.code === 'auth/network-request-failed' || e.code === 'auth/internal-error' || e.message?.includes('network-request-failed') || e.message?.includes('internal-error')) {
        alert('Network or Internal Error. If you are using Google Sign-In, please open the app in a new tab (using the button at the top right) due to iframe restrictions. Otherwise, check your credentials.');
      } else {
        alert(e.message?.replace('Firebase: ', '') || 'Failed to register');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4 relative">
      <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 font-bold uppercase text-primary hover:text-primary/70 transition-colors" />

      <Link to="/" className="mb-8 hover:opacity-80 transition-opacity"><Logo size="lg" /></Link>
      <div className="bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] w-full max-w-md">
        <h1 className="font-display text-3xl uppercase mb-2">
          {role === 'DOCTOR' ? 'Doctor Registration' : 'Patient Registration'}
        </h1>
        <p className="text-primary/70 mb-8">
          {role === 'DOCTOR' ? 'Join CarePoint as a medical professional.' : 'Join CarePoint to book appointments.'}
        </p>
        
        <form onSubmit={handleEmailRegister} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Password</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
            />
          </div>

          {role === 'DOCTOR' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-sm mb-1">Specialization</label>
                  <input value={specialization} onChange={e => setSpecialization(e.target.value)} required className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" placeholder="e.g., Cardiologist" />
                </div>
                <div>
                  <label className="block font-bold uppercase text-sm mb-1">Department</label>
                  <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} required className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold uppercase text-sm mb-1">Qualification</label>
                <input value={qualification} onChange={e => setQualification(e.target.value)} required className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" placeholder="e.g., MD, MBBS" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-sm mb-1">Experience (Years)</label>
                  <input type="number" value={experience} onChange={e => setExperience(e.target.value)} required min="0" className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" placeholder="e.g., 5" />
                </div>
                <div>
                  <label className="block font-bold uppercase text-sm mb-1">Registration No.</label>
                  <input value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} required className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" placeholder="e.g., MED-12345" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-primary/20 flex-1"></div>
          <span className="text-sm font-bold uppercase text-primary/40">OR</span>
          <div className="h-px bg-primary/20 flex-1"></div>
        </div>
        
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 bg-white text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-light transition-colors mb-4 flex items-center justify-center gap-3 disabled:opacity-70"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        
        <div className="mt-6 text-center text-primary/70">
          Already have an account? <Link to={role === 'DOCTOR' ? '/doctor/login' : '/patient/login'} className="text-primary font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
