import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BackButton from './ui/BackButton';
import { Logo } from './ui/Logo';
import { useAuth } from './AuthContext';

export default function LoginPage({ type = 'PATIENT' }: { type?: 'PATIENT' | 'DOCTOR' | 'ADMIN' }) {
  const { user, profile, signIn, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && profile) {
      if (type === 'PATIENT') navigate('/patient/dashboard');
      else if (type === 'DOCTOR') navigate('/doctor/dashboard');
      else if (type === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [user, profile, navigate, type]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
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
        alert(e.message?.replace('Firebase: ', '') || 'Failed to sign in');
      }
      setLoading(false);
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmail(email, password);
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
        alert(e.message?.replace('Firebase: ', '') || 'Failed to sign in');
      }
    }
  };

  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4 relative">
      <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 font-bold uppercase text-primary hover:text-primary/70 transition-colors" />

      <Link to="/" className="mb-8 hover:opacity-80 transition-opacity"><Logo size="lg" /></Link>
      <div className="bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] w-full max-w-md">
        <h1 className="font-display text-3xl uppercase mb-2">
          {type === 'ADMIN' ? 'Admin Login' : type === 'DOCTOR' ? 'Doctor Login' : 'Patient Login'}
        </h1>
        <p className="text-primary/70 mb-8">Log in to manage your account.</p>
        
        <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold uppercase">Password</label>
              <Link to="/forgot-password" className="text-sm text-primary/70 hover:text-primary font-medium hover:underline">Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold uppercase tracking-wide hover:bg-secondary transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
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
          Sign in with Google
        </button>
        
        {type !== 'ADMIN' && (
          <div className="mt-6 text-center text-primary/70">
            Don't have an account? <Link to={type === 'DOCTOR' ? '/doctor/register' : '/patient/register'} className="text-primary font-bold hover:underline">Register here</Link>
          </div>
        )}
      </div>
    </div>
  );
}
