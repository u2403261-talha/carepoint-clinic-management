import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorAppointments() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await fetch('/api/doctors/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    
    if (profile) fetchAppointments();
  }, [profile]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`)) return;
    }
    
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredApps = appointments.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'TODAY') return a.date === new Date().toISOString().split('T')[0];
    if (filter === 'UPCOMING') return a.date > new Date().toISOString().split('T')[0];
    return a.status === filter;
  });

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading appointments...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold uppercase">{error}</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase">Appointments</h1>
          <p className="text-primary/60 mt-2 font-medium">Manage your schedule and consultations.</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['ALL', 'TODAY', 'UPCOMING', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-bold uppercase text-sm border-2 whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-light border-primary' : 'bg-white border-primary/20 text-primary hover:border-primary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-white border-2 border-primary p-12 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <p className="font-bold uppercase text-primary/60 text-lg">No appointments found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-white border-2 border-primary flex flex-col shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
              <div className="p-4 border-b-2 border-primary flex justify-between items-start">
                <div>
                  <div className="font-display text-xl uppercase mb-1">{app.patientName}</div>
                  <span className={`px-2 py-1 text-xs font-bold uppercase ${app.status === 'CONFIRMED' ? 'bg-sage/30' : app.status === 'PENDING' ? 'bg-accent/30' : 'bg-light border border-primary/20'}`}>{app.status}</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-bold"><Calendar className="w-4 h-4" /> {app.date}</div>
                  <div className="flex items-center gap-1 text-sm text-primary/70"><Clock className="w-4 h-4" /> {app.startTime}</div>
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="text-sm">
                  <span className="font-bold uppercase">Reason: </span>
                  {app.reason || 'Not specified'}
                </div>
              </div>
              <div className="p-4 border-t-2 border-primary bg-light/50 flex gap-2">
                {app.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')} className="flex-1 py-2 bg-sage border-2 border-primary font-bold uppercase text-xs hover:bg-[#A3B5B0]">Accept</button>
                    <button onClick={() => handleUpdateStatus(app.id, 'REJECTED')} className="flex-1 py-2 bg-white border-2 border-primary font-bold uppercase text-xs hover:bg-light">Reject</button>
                  </>
                )}
                {app.status === 'CONFIRMED' && (
                  <>
                    <Link to={`/doctor/appointments/${app.id}`} className="flex-1 py-2 bg-accent border-2 border-primary font-bold uppercase text-xs text-center hover:bg-[#FFD13B]">Start Consultation</Link>
                    <button onClick={() => handleUpdateStatus(app.id, 'CANCELLED')} className="px-3 py-2 bg-white border-2 border-primary font-bold uppercase text-xs hover:bg-red-50 hover:text-red-600 transition-colors">Cancel</button>
                  </>
                )}
                {(app.status === 'COMPLETED' || app.status === 'CANCELLED' || app.status === 'REJECTED') && (
                  <Link to={`/doctor/appointments/${app.id}`} className="flex-1 py-2 bg-white border-2 border-primary font-bold uppercase text-xs text-center hover:bg-light">View Details</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
