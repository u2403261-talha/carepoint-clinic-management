import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Users, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorPatients() {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await fetch('/api/doctors/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch patients');
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    
    if (profile) fetchPatients();
  }, [profile]);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading patients...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold uppercase">{error}</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase">Patient Directory</h1>
          <p className="text-primary/60 mt-2 font-medium">Patients who have booked appointments with you.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-primary bg-white focus:outline-none focus:border-accent"
          />
        </div>
      </header>

      {patients.length === 0 ? (
        <div className="bg-white border-2 border-primary p-12 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <Users className="w-12 h-12 text-primary/20 mx-auto mb-4" />
          <p className="font-bold uppercase text-primary/60 text-lg">Patients will appear here after they book an appointment with you.</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white border-2 border-primary p-12 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <p className="font-bold uppercase text-primary/60 text-lg">No patients found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-primary shadow-[4px_4px_0px_0px_rgba(23,30,25,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light border-b-2 border-primary">
                  <th className="p-4 font-bold uppercase text-sm">Name</th>
                  <th className="p-4 font-bold uppercase text-sm">Gender / DOB</th>
                  <th className="p-4 font-bold uppercase text-sm">Last Visit</th>
                  <th className="p-4 font-bold uppercase text-sm">Appointments</th>
                  <th className="p-4 font-bold uppercase text-sm"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-primary/10">
                {filteredPatients.map(p => (
                  <tr key={p.id} className="hover:bg-light/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold uppercase">{p.name}</div>
                      <div className="text-sm text-primary/70">{p.email}</div>
                    </td>
                    <td className="p-4 font-medium text-sm">
                      {p.dob ? p.dob : 'N/A'}
                    </td>
                    <td className="p-4 font-medium text-sm">{p.lastVisit || 'N/A'}</td>
                    <td className="p-4 font-bold text-lg">{p.appointmentsCount}</td>
                    <td className="p-4 text-right">
                      <Link to={`/doctor/patients/${p.id}`} className="inline-flex items-center gap-1 px-4 py-2 bg-accent border-2 border-primary font-bold uppercase text-xs hover:bg-[#FFD13B] transition-colors">
                        View Profile <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
