import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BackButton from './ui/BackButton';
import { Logo } from './ui/Logo';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message?.replace('Firebase: ', '') || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4 relative">
      <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 font-bold uppercase text-primary hover:text-primary/70 transition-colors" />

      <Link to="/" className="mb-8 hover:opacity-80 transition-opacity"><Logo size="lg" /></Link>
      <div className="bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] w-full max-w-md">
        <h1 className="font-display text-3xl uppercase mb-2">Reset Password</h1>
        
        {success ? (
          <div className="text-center">
            <div className="bg-sage/20 border-2 border-sage text-primary p-4 mb-6 font-medium">
              Password reset email sent! Check your inbox for further instructions.
            </div>
            <Link to="/patient/login" className="w-full py-4 bg-primary text-white font-bold uppercase tracking-wide hover:bg-secondary transition-colors flex items-center justify-center gap-3">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-primary/70 mb-8">Enter your registered email and we will send you a link to reset your password.</p>
            
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-6 font-medium text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4 mb-6">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="mt-6 text-center text-primary/70">
              <BackButton fallback="/patient/login" label="Back to Login" className="text-primary font-bold hover:underline" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
