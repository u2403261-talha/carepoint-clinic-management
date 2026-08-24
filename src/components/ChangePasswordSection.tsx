import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ChangePasswordSection() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Please choose a stronger password. Minimum 6 characters.');
      return;
    }

    if (!user || !user.email) return;

    try {
      setLoading(true);
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('The current password is incorrect.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('For security, please sign in again before changing your password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else {
        setError(err.message?.replace('Firebase: ', '') || 'Failed to change password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] max-w-2xl mt-8">
      <h2 className="font-display text-2xl uppercase mb-6 pb-2 border-b-2 border-primary">Security</h2>
      <h3 className="font-bold uppercase text-lg mb-4">Change Password</h3>
      
      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-6 font-medium text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-sage/20 border-2 border-sage text-primary p-3 mb-6 font-bold uppercase text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-1">Current Password</label>
          <input 
            type="password" 
            required 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-1">New Password</label>
          <input 
            type="password" 
            required 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-1">Confirm New Password</label>
          <input 
            type="password" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" 
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white font-bold uppercase tracking-wide hover:bg-secondary transition-colors border-2 border-primary disabled:opacity-50"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
