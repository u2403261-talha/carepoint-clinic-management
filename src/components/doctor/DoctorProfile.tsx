import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function DoctorProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setData(await res.json());
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    if (profile) fetchProfile();
  }, [profile]);

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading profile...</div>;

  const doc = data?.doctorProfile;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="font-display text-4xl uppercase">My Profile</h1>
      </header>
      
      <div className="bg-white border-2 border-primary p-8 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
        <h2 className="font-bold uppercase text-xl mb-6 pb-2 border-b-2 border-primary">Personal Details</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Full Name</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.name}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Email</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.email}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Phone</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{data?.phone || 'Not provided'}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Status</label>
            <div className="p-3 bg-sage/20 border-2 border-sage font-bold uppercase">{data?.status}</div>
          </div>
        </div>

        <h2 className="font-bold uppercase text-xl mb-6 pb-2 border-b-2 border-primary">Professional Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Specialization</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{doc?.specialization}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Qualification</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{doc?.qualification}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Experience (Years)</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{doc?.experience}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-primary/60 mb-1">Registration Number</label>
            <div className="p-3 bg-light border-2 border-primary/20 font-medium">{doc?.registrationNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
