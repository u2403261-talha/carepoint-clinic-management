import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import DeleteAccountSection from '../DeleteAccountSection';

export default function DoctorProfileManager({ activeTab = 'profile' }: { activeTab?: 'profile' | 'settings' }) {
  const { user, profile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    qualification: '',
    specialization: '',
    departmentId: '',
    experience: '',
    registrationNumber: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await user?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profRes, deptRes] = await Promise.all([
          fetch('/api/doctors/profile', { headers }),
          fetch('/api/departments')
        ]);
        
        if (profRes.ok) {
          const data = await profRes.json();
          setDoctorData(data.doctor);
          setFormData({
            name: data.user.name || '',
            phone: data.user.phone || '',
            qualification: data.doctor?.qualification || '',
            specialization: data.doctor?.specialization || '',
            departmentId: data.doctor?.departmentId?.toString() || '',
            experience: data.doctor?.experience?.toString() || '',
            registrationNumber: data.doctor?.registrationNumber || '',
            bio: data.doctor?.bio || ''
          });
        }
        
        if (deptRes.ok) {
          setDepartments(await deptRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaveLoading(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/doctors/profile', {
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
      
      // Update local state to reflect changes
      setDoctorData({
        ...doctorData,
        qualification: formData.qualification,
        specialization: formData.specialization,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        registrationNumber: formData.registrationNumber,
        bio: formData.bio
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
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

    setSaveLoading(true);

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
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading profile...</div>;

  const departmentName = departments.find(d => d.id.toString() === doctorData?.departmentId?.toString())?.name || 'Not assigned';

  
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {activeTab === 'profile' && (
      <div>
        <h2 className="font-display text-3xl uppercase mb-6">Profile Settings</h2>
        
        {message && <div className="mb-6 p-4 bg-sage/20 text-primary border-2 border-primary font-bold">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-600 border-2 border-red-500 font-bold">{error}</div>}

        <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
          <div className="flex justify-between items-center mb-6 border-b-2 border-primary/10 pb-4">
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
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Full Name</p>
                  <p className="font-medium text-lg">Dr. {formData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Email</p>
                  <p className="font-medium text-lg">{profile?.email} <span className="text-xs text-primary/50 ml-2">(Managed by authentication)</span></p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Phone Number</p>
                  <p className="font-medium text-lg">{formData.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Registration Number</p>
                  <p className="font-medium text-lg">{formData.registrationNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-primary/10 grid md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Qualification</p>
                  <p className="font-medium text-lg">{formData.qualification || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Specialization</p>
                  <p className="font-medium text-lg">{formData.specialization || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Department</p>
                  <p className="font-medium text-lg">{departmentName}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Experience</p>
                  <p className="font-medium text-lg">{formData.experience ? `${formData.experience} Years` : 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-bold uppercase text-primary/60 mb-1">Professional Bio</p>
                  <p className="font-medium">{formData.bio || 'No bio provided'}</p>
                </div>
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
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Registration Number</label>
                  <input 
                    type="text" 
                    name="registrationNumber" 
                    value={formData.registrationNumber} 
                    onChange={handleProfileChange}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Qualification</label>
                  <input 
                    type="text" 
                    name="qualification" 
                    value={formData.qualification} 
                    onChange={handleProfileChange}
                    required
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleProfileChange}
                    required
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleProfileChange}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Years of Experience</label>
                  <input 
                    type="number" 
                    name="experience" 
                    value={formData.experience} 
                    onChange={handleProfileChange}
                    min="0"
                    required
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Professional Bio</label>
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={saveLoading}
                  className="px-6 py-3 bg-accent text-primary font-bold uppercase tracking-wide border-2 border-primary hover:bg-[#FFD13B] transition-colors disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  disabled={saveLoading}
                  className="px-6 py-3 bg-white text-primary font-bold uppercase tracking-wide border-2 border-primary hover:bg-light transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      )}

      {activeTab === 'settings' && (
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
                disabled={saveLoading}
                className="w-full py-3 bg-primary text-white font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saveLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
        <DeleteAccountSection />
      </div>
      )}
    </div>
  );
}
