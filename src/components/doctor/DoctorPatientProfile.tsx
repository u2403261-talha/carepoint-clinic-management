import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Pill, FileText } from 'lucide-react';
import BackButton from '../ui/BackButton';

export default function DoctorPatientProfile() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('APPOINTMENTS'); // APPOINTMENTS, CONSULTATIONS, PRESCRIPTIONS

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await fetch(`/api/doctors/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch patient data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load patient profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (profile && id) fetchPatient();
  }, [profile, id]);

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading profile...</div>;
  if (error || !data) return <div className="p-8 text-red-500 font-bold uppercase">{error || 'Patient not found'}</div>;

  const { patient, appointments, prescriptions } = data;
  
  const completedAppts = appointments.filter((a: any) => a.status === 'COMPLETED');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <BackButton fallback="/doctor/patients" label="Back to Directory" className="inline-flex items-center gap-2 font-bold uppercase text-sm hover:text-accent transition-colors" />
      
      <div className="bg-white border-2 border-primary shadow-[4px_4px_0px_0px_rgba(23,30,25,1)] flex flex-col md:flex-row">
        <div className="p-8 md:w-1/3 border-b-2 md:border-b-0 md:border-r-2 border-primary bg-light/50 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary text-light rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10" />
          </div>
          <h1 className="font-display text-2xl uppercase mb-1">{patient.name}</h1>
          <p className="text-primary/70 font-medium mb-6">{patient.email}</p>
          
          <div className="w-full space-y-3 text-sm text-left">
            <div className="flex justify-between border-b border-primary/10 pb-2">
              <span className="font-bold uppercase text-primary/60">Phone</span>
              <span className="font-medium">{patient.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-primary/10 pb-2">
              <span className="font-bold uppercase text-primary/60">DOB</span>
              <span className="font-medium">{patient.dob || 'N/A'}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-bold uppercase text-primary/60">Total Visits</span>
              <span className="font-medium">{completedAppts.length}</span>
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3 flex flex-col">
          <div className="flex border-b-2 border-primary overflow-x-auto">
            {['APPOINTMENTS', 'CONSULTATIONS', 'PRESCRIPTIONS'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold uppercase text-sm whitespace-nowrap transition-colors flex-1 ${activeTab === tab ? 'bg-primary text-light' : 'hover:bg-light'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
            {activeTab === 'APPOINTMENTS' && (
              <div className="space-y-4">
                {appointments.length === 0 ? <p className="text-primary/60 italic">No appointments found.</p> : appointments.map((app: any) => (
                  <div key={app.id} className="p-4 border-2 border-primary bg-light flex justify-between items-center">
                    <div>
                      <div className="font-bold uppercase mb-1">{app.date} at {app.startTime}</div>
                      <div className="text-sm text-primary/70">Reason: {app.reason || 'General'}</div>
                    </div>
                    <span className="px-3 py-1 bg-white border border-primary text-xs font-bold uppercase">{app.status}</span>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'CONSULTATIONS' && (
              <div className="space-y-6">
                {completedAppts.length === 0 ? <p className="text-primary/60 italic">No consultation records found.</p> : completedAppts.map((app: any) => (
                  <div key={app.id} className="p-5 border-2 border-primary bg-white shadow-[2px_2px_0px_0px_rgba(23,30,25,1)]">
                    <div className="flex justify-between border-b-2 border-primary pb-3 mb-3">
                      <div className="font-bold uppercase flex items-center gap-2"><Calendar className="w-4 h-4" /> {app.date}</div>
                    </div>
                    
                    {(app.temperature || app.bloodPressure || app.heartRate || app.spo2) && (
                      <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-light border border-primary/20 text-xs">
                        {app.temperature && <div><span className="font-bold text-primary/60 block">TEMP</span>{app.temperature}</div>}
                        {app.bloodPressure && <div><span className="font-bold text-primary/60 block">BP</span>{app.bloodPressure}</div>}
                        {app.heartRate && <div><span className="font-bold text-primary/60 block">HR</span>{app.heartRate}</div>}
                        {app.spo2 && <div><span className="font-bold text-primary/60 block">SpO2</span>{app.spo2}</div>}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {app.symptoms && (
                        <div>
                          <h4 className="font-bold uppercase text-xs text-primary/60 mb-1">Symptoms</h4>
                          <p className="text-sm">{app.symptoms}</p>
                        </div>
                      )}
                      {app.diagnosis && (
                        <div>
                          <h4 className="font-bold uppercase text-xs text-primary/60 mb-1">Diagnosis</h4>
                          <p className="text-sm">{app.diagnosis}</p>
                        </div>
                      )}
                      {app.notes && (
                        <div>
                          <h4 className="font-bold uppercase text-xs text-primary/60 mb-1">Notes</h4>
                          <p className="text-sm">{app.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'PRESCRIPTIONS' && (
              <div className="space-y-6">
                {prescriptions.length === 0 ? <p className="text-primary/60 italic">No prescriptions found.</p> : (() => {
                  // Group prescriptions by appointment ID
                  const grouped = prescriptions.reduce((acc: any, p: any) => {
                    if (!acc[p.appointmentId]) acc[p.appointmentId] = [];
                    acc[p.appointmentId].push(p);
                    return acc;
                  }, {});
                  
                  return Object.keys(grouped).map(apptId => {
                    const appt = appointments.find((a: any) => a.id === parseInt(apptId));
                    return (
                      <div key={apptId} className="p-5 border-2 border-primary bg-white shadow-[2px_2px_0px_0px_rgba(23,30,25,1)]">
                        <div className="flex justify-between border-b-2 border-primary pb-3 mb-4">
                          <div className="font-bold uppercase flex items-center gap-2"><Calendar className="w-4 h-4" /> {appt?.date || 'Unknown Date'}</div>
                        </div>
                        <div className="space-y-3">
                          {grouped[apptId].map((med: any) => (
                            <div key={med.id} className="p-3 bg-light border border-primary/20">
                              <div className="font-bold uppercase mb-1">{med.medicine} - {med.dosage}</div>
                              <div className="text-sm font-medium flex gap-4 text-primary/80">
                                <span>{med.frequency}</span>
                                <span>{med.duration}</span>
                              </div>
                              {med.instructions && <div className="text-xs text-primary/60 mt-1 italic">Note: {med.instructions}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
