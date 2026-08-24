import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Calendar, Clock } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/patient/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAppointments(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        alert('Failed to cancel');
      }
    } catch (e) {
      alert('Error cancelling appointment');
    }
  };

  if (loading) return <div className="font-bold uppercase animate-pulse">Loading appointments...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6">My Appointments</h2>
      {appointments.length === 0 ? (
        <div className="bg-white border-2 border-primary p-10 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <p className="text-primary/60 font-medium text-lg mb-4">No appointments scheduled.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {appointments.map(app => (
            <div key={app.id} className="bg-white border-2 border-primary p-6 flex flex-col shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="font-display text-2xl uppercase mb-1">{app.doctorName}</div>
                  <div className="text-primary/70">{app.specialization}</div>
                </div>
                <div className="px-3 py-1 bg-sage/20 font-bold text-sm uppercase">
                  {app.status}
                </div>
              </div>
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3 font-medium">
                  <Calendar className="w-5 h-5 text-primary/50" /> 
                  {new Date(app.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-3 font-medium">
                  <Clock className="w-5 h-5 text-primary/50" /> {app.startTime}
                </div>
                {app.ticketId && (
                  <div className="mt-4 pt-4 border-t-2 border-primary/10 flex items-center gap-6">
                    <div className="bg-white p-2 border-2 border-primary inline-block">
                      <QRCodeSVG value={app.ticketId} size={80} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase text-primary/50 mb-1">Ticket ID</div>
                      <div className="font-mono text-lg font-bold">{app.ticketId}</div>
                    </div>
                  </div>
                )}
              </div>
              {app.status === 'PENDING' && (
                <button 
                  onClick={() => handleCancelAppointment(app.id)}
                  className="w-full py-3 bg-red-100 text-red-600 font-bold uppercase hover:bg-red-200 transition-colors border-2 border-red-200"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
