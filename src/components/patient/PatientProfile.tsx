import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../../lib/firebase';

export default function PatientProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setFormData({
          name: json.name || '',
          phone: json.phone || '',
          dob: json.dob || ''
        });
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) fetchProfile();
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await user?.getIdToken();
      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert('Profile updated successfully.');
        setIsEditing(false);
        fetchProfile();
      } else {
        alert('Failed to update profile.');
      }
    } catch (e) {
      alert('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="font-bold uppercase animate-pulse">Loading profile...</div>;

  return (
    <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] max-w-2xl">
      <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-primary">
        <h2 className="font-bold uppercase text-xl">Personal Information</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm font-bold uppercase text-accent hover:text-accent/80 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Full Name</label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Email <span className="text-primary/50 normal-case text-xs">(Managed by authentication)</span></label>
            <input 
              type="email"
              disabled
              value={data?.email || ''}
              className="w-full p-3 border-2 border-primary/20 bg-gray-100 text-primary/60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Phone Number</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent"
              placeholder="+1 234 567 8900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Date of Birth</label>
            <input 
              type="date"
              value={formData.dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setFormData({...formData, dob: e.target.value})}
              className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: data.name || '',
                  phone: data.phone || '',
                  dob: data.dob || ''
                });
              }}
              className="flex-1 py-3 bg-light text-primary font-bold uppercase border-2 border-primary hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-accent text-primary font-bold uppercase border-2 border-primary hover:bg-[#FFD13B] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Full Name</label>
              <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.name}</div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Email</label>
              <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.email}</div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Phone Number</label>
              <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.phone || 'Not provided'}</div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Date of Birth</label>
              <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.dob || 'Not provided'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
