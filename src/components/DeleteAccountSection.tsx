import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function DeleteAccountSection() {
  const { user, logOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performFullDeletion = async () => {
     if (!user) return;
     try {
       setLoading(true);
       setError('');
       
       // Step 1: Get token BEFORE deleting the user
       const token = await user.getIdToken();

       // Step 2: Delete Firebase Auth user client-side. This might throw 'auth/requires-recent-login'
       await user.delete();

       // Step 3: Tell backend to anonymize/delete data
       const res = await fetch('/api/users/me', {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
       });

       if (!res.ok) {
         const data = await res.json();
         // Data is anonymized or error. We can't undo auth deletion, but we tried.
         console.error('Backend deletion error:', data.error);
       }
       
       // Step 4: Sign out and redirect
       await logOut();
       window.location.href = '/';
       
     } catch (err: any) {
       if (err.code === 'auth/requires-recent-login' || err.message.includes('requires-recent-login')) {
         setShowPasswordPrompt(true);
       } else {
         setError(err.message || 'An error occurred while deleting your account.');
       }
     } finally {
       setLoading(false);
     }
  };

  const handleReauthAndFullDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    try {
      setLoading(true);
      setError('');
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      setShowPasswordPrompt(false);
      await performFullDeletion();
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-red-500 p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] max-w-2xl mt-8">
      <h2 className="font-display text-3xl uppercase text-red-600 mb-2">Delete Account</h2>
      <p className="text-red-800/80 mb-6 font-medium">
        Deleting your account is permanent. Your account access will be removed and this action cannot be undone.
      </p>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-6 font-medium text-sm">
          {error}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-red-500 text-white font-bold uppercase tracking-wide hover:bg-red-600 transition-colors border-2 border-red-700"
      >
        Delete My Account
      </button>

      {showModal && !showPasswordPrompt && (
        <div className="fixed inset-0 bg-primary/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-500 p-8 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] max-w-md w-full">
            <h3 className="font-display text-2xl uppercase text-red-600 mb-4">Delete your account?</h3>
            <p className="text-primary mb-8 font-medium">
              This action is permanent. Your account will be deleted and you will no longer be able to sign in.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 bg-light text-primary font-bold uppercase border-2 border-primary hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={performFullDeletion}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 text-white font-bold uppercase border-2 border-red-700 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-primary/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-500 p-8 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] max-w-md w-full">
            <h3 className="font-display text-2xl uppercase mb-4">Re-authentication Required</h3>
            <p className="text-primary mb-6 text-sm">
              For security reasons, please re-enter your password to confirm account deletion.
            </p>
            <form onSubmit={handleReauthAndFullDelete} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-red-500" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-light text-primary font-bold uppercase border-2 border-primary hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500 text-white font-bold uppercase border-2 border-red-700 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
