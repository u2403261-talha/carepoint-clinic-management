import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Pill, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorPrescriptions() {
  const { user, profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await fetch('/api/doctors/prescriptions', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPrescriptions(await res.json());
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    if (profile) fetchPrescriptions();
  }, [profile]);

  const filtered = prescriptions.filter(p => p.patientName.toLowerCase().includes(search.toLowerCase()) || p.medicine.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="font-display text-4xl uppercase">Prescriptions</h1>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border-2 border-primary focus:outline-none" />
        </div>
      </header>

      {prescriptions.length === 0 ? (
        <div className="bg-white border-2 border-primary p-12 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <p className="font-bold uppercase text-primary/60">You haven't created any prescriptions yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p.id} className="bg-white border-2 border-primary p-5 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
              <div className="flex justify-between items-start mb-4 border-b-2 border-primary pb-3">
                <div>
                  <div className="font-bold uppercase text-lg">{p.medicine}</div>
                  <div className="text-sm font-medium">{p.dosage} - {p.frequency}</div>
                </div>
                <Pill className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="font-bold text-primary/60">Patient</span><Link to={`/doctor/patients/${p.patientId}`} className="font-bold hover:underline">{p.patientName}</Link></div>
                <div className="flex justify-between"><span className="font-bold text-primary/60">Date</span><span>{p.appointmentDate}</span></div>
                <div className="flex justify-between"><span className="font-bold text-primary/60">Duration</span><span>{p.duration}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
