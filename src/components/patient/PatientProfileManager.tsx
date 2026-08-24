import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { auth, db } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import DeleteAccountSection from '../DeleteAccountSection';

export default function PatientProfileManager() {
  const { user, profile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    dob: profile?.dob || '',
    
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setMessage('Profile updated successfully.');
      setIsEditing(false);
      // Let the main auth context re-fetch or we can force reload
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateAuthPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwordData.newPassword);
        setMessage('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error("No user logged in.");
      }
    } catch (err: any) {
      let errorMessage = 'Failed to change password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'The current password is incorrect.';
      } else if (err.code === 'auth/requires-recent-login') {
        errorMessage = 'For security, please sign in again before changing your password.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-display text-3xl uppercase mb-6">Account Settings</h2>
        
        {message && <div className="mb-6 p-4 bg-sage/20 text-primary border-2 border-primary font-bold">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-600 border-2 border-red-500 font-bold">{error}</div>}

        <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold uppercase text-xl">Profile Information</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border-2 border-primary bg-light hover:bg-white font-bold uppercase text-sm transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm font-bold uppercase text-primary/60 mb-1">Full Name</p>
                <p className="font-medium text-lg">{profile?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-primary/60 mb-1">Email</p>
                <p className="font-medium text-lg">{profile?.email} <span className="text-xs text-primary/50 ml-2">(Managed by authentication)</span></p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-primary/60 mb-1">Phone Number</p>
                <p className="font-medium text-lg">{profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-primary/60 mb-1">Date of Birth</p>
                <p className="font-medium text-lg">{profile?.dob || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleProfileChange}
                    required
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Email</label>
                  <input 
                    type="email" 
                    value={profile?.email} 
                    disabled
                    className="w-full p-3 border-2 border-primary/20 bg-gray-100 text-primary/60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleProfileChange}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleProfileChange}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-3 bg-accent text-primary font-bold uppercase tracking-wide border-2 border-primary hover:bg-[#FFD13B] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-white text-primary font-bold uppercase tracking-wide border-2 border-primary hover:bg-light transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-3xl uppercase mb-6">Security</h2>
        <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
          <h3 className="font-bold uppercase text-xl mb-6">Change Password</h3>
          <form onSubmit={updateAuthPassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase text-primary mb-2">Current Password</label>
              <input 
                type="password" 
                name="currentPassword" 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange}
                required
                className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-primary mb-2">New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange}
                required
                className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-primary mb-2">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange}
                required
                className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DeleteAccountSection />
    </div>
  );
}
