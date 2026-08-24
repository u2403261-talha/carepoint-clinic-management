import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Calendar, Clock, LogOut, CheckCircle2, User, FileText, Settings } from 'lucide-react';
import { auth } from '../lib/firebase';
import DeleteAccountSection from './DeleteAccountSection';
import DoctorProfileManager from './doctor/DoctorProfileManager';

export default function DoctorDashboard() {
  const { profile, logOut } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments' | 'settings'>('schedule');
  const [selectedAppt, setSelectedAppt] = useState<any>(null); // For consultation form
  
  const fetchAppointments = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/doctors/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAppointments(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleCompleteConsultation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAppt) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Parse single prescription for simplicity
    const prescriptions = [];
    if (data.medicine) {
      prescriptions.push({
        medicine: data.medicine,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions
      });
    }

    const payload = {
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      notes: data.notes,
      prescriptions
    };

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/appointments/${selectedAppt.id}/consultation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSelectedAppt(null);
        fetchAppointments();
      } else {
        alert('Failed to save consultation');
      }
    } catch (err) {
      alert('Error saving consultation');
    }
  };

  useEffect(() => {
    if (profile.status === 'ACTIVE') {
      fetchAppointments();
    }
  }, [activeTab, profile.status]);

  if (profile.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border-2 border-primary p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] space-y-6">
          <Clock className="w-16 h-16 mx-auto text-sage" />
          <h1 className="font-display text-4xl uppercase">Application Pending</h1>
          <p className="text-primary/70 font-medium">Your registration as a doctor is currently under review by our administration team. You will have access to your dashboard once approved.</p>
          <button onClick={logOut} className="font-bold underline uppercase tracking-wide">Sign Out</button>
        </div>
      </div>
    );
  }

  const handleScheduleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/doctors/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      if (res.ok) {
        alert('Schedule updated successfully!');
      } else {
        alert('Failed to update schedule');
      }
    } catch (err) {
      alert('Error updating schedule');
    }
  };

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-primary text-white border-r border-primary/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="font-display text-2xl uppercase flex items-center gap-2">
            <div className="w-5 h-5 bg-sage rounded-sm"></div>
            Doctor Portal
          </div>
        </div>
        <div className="p-6 flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'schedule' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Calendar className="w-5 h-5" /> Schedule
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'appointments' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Clock className="w-5 h-5" /> Appointments
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'settings' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </div>
        <div className="p-6 border-t border-white/10">
          <div className="mb-4 font-medium truncate text-white/70">Dr. {profile.name}</div>
          <button onClick={logOut} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="font-display text-4xl uppercase border-b-2 border-primary pb-4">
            {activeTab === 'schedule' && 'My Schedule'}
            {activeTab === 'appointments' && 'My Appointments'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          
          {activeTab === 'schedule' && (
            <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
              <form onSubmit={handleScheduleUpdate} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Working Days</label>
                  <input name="workingDays" placeholder="e.g. Monday, Tuesday, Wednesday" defaultValue="Monday,Tuesday,Wednesday,Thursday,Friday" required className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-bold uppercase text-sm mb-2">Start Time</label>
                    <input type="time" name="startTime" defaultValue="09:00" required className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-sm mb-2">End Time</label>
                    <input type="time" name="endTime" defaultValue="17:00" required className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Slot Duration (Minutes)</label>
                  <select name="slotDuration" defaultValue="20" required className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent">
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="px-8 py-4 bg-accent text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors">
                    Save Schedule
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {appointments.length === 0 ? (
                <div className="bg-white border-2 border-primary p-10 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <p className="text-primary/60 font-medium text-lg">No appointments scheduled.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {appointments.map(app => (
                    <div key={app.id} className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="font-display text-2xl uppercase">{app.patientName}</div>
                        <div className="px-3 py-1 bg-sage/20 font-bold text-sm">{app.status}</div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar className="w-4 h-4 text-primary/50" /> {app.date}
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4 text-primary/50" /> {app.startTime}
                        </div>
                      </div>
                      {app.reason && (
                        <div className="p-3 bg-light border border-primary/10 text-sm mb-4">
                          <strong>Reason:</strong> {app.reason}
                        </div>
                      )}
                      
                      <div className="space-y-2 mt-4">
                        {app.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')} className="flex-1 py-2 bg-sage text-primary font-bold uppercase border-2 border-primary hover:bg-[#A3B5B0]">Confirm</button>
                            <button onClick={() => handleUpdateStatus(app.id, 'REJECTED')} className="flex-1 py-2 bg-white text-primary font-bold uppercase border-2 border-primary hover:bg-light">Reject</button>
                          </div>
                        )}
                        {app.status === 'CONFIRMED' && (
                          <button onClick={() => setSelectedAppt(app)} className="w-full py-2 bg-accent text-primary font-bold uppercase border-2 border-primary hover:bg-[#FFD13B]">
                            Complete Consultation
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && <DoctorProfileManager />}
        </div>
      </main>

      {selectedAppt && (
        <div className="fixed inset-0 bg-primary/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-primary w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(23,30,25,1)] p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl uppercase">Consultation Notes</h2>
              <button onClick={() => setSelectedAppt(null)} className="text-primary hover:text-primary/70">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-light border border-primary/10">
              <div className="font-bold text-lg mb-1">{selectedAppt.patientName}</div>
              <div className="text-primary/70 text-sm">{selectedAppt.date} at {selectedAppt.startTime}</div>
            </div>

            <form onSubmit={handleCompleteConsultation} className="space-y-6">
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Symptoms</label>
                <textarea name="symptoms" required rows={3} className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
              </div>
              
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Diagnosis</label>
                <textarea name="diagnosis" required rows={3} className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="block font-bold uppercase text-sm mb-2">Prescription (Optional)</label>
                <div className="p-4 border-2 border-primary bg-light space-y-4">
                  <input name="medicine" placeholder="Medicine Name" className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="dosage" placeholder="Dosage (e.g. 500mg)" className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                    <input name="frequency" placeholder="Frequency (e.g. 2 times a day)" className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                  </div>
                  <input name="duration" placeholder="Duration (e.g. 5 days)" className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                  <textarea name="instructions" placeholder="Instructions (e.g. After meals)" rows={2} className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-accent text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors mt-6">
                Save & Complete Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
