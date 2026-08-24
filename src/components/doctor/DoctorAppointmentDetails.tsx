import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Plus, X } from 'lucide-react';
import BackButton from '../ui/BackButton';

export default function DoctorAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Consultation form
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', bloodPressure: '', heartRate: '', spo2: '' });
  
  // Prescription form
  const [medicines, setMedicines] = useState([{ medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await user?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch appointment details - we need to add this endpoint or filter from the list
        // Wait, the API doesn't have GET /api/doctors/appointments/:id, I should add it to server.ts or use the patient endpoint
        // I will fetch all appointments and find this one for now, or fetch patient details if we know the patient id
        
        // Let's create an endpoint in our doctorRoutes or just fetch all and find
        const res = await fetch('/api/doctors/appointments', { headers });
        if (!res.ok) throw new Error('Failed to fetch');
        const apps = await res.json();
        const appt = apps.find((a: any) => a.id === parseInt(id || '0'));
        if (!appt) throw new Error('Appointment not found');
        
        setAppointment(appt);
        setSymptoms(appt.symptoms || '');
        setDiagnosis(appt.diagnosis || '');
        setNotes(appt.notes || '');
        setVitals({
          temperature: appt.temperature || '',
          bloodPressure: appt.bloodPressure || '',
          heartRate: appt.heartRate || '',
          spo2: appt.spo2 || ''
        });
        
        // Fetch patient details
        // Wait, appt only has patientName. To get the patient profile, I should add the patient details to the appointment fetch in server.ts
        // For now, I'll display what we have. If we need full patient profile, we can fetch it via /api/doctors/patients/:id if we had patientId
      } catch (err) {
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    
    if (profile && id) fetchDetails();
  }, [profile, id]);

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/doctors/appointments/${id}/consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symptoms, diagnosis, notes, ...vitals })
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Consultation saved successfully');
    } catch (err) {
      alert('Failed to save consultation');
    }
  };

  const handleSavePrescription = async () => {
    // filter out empty medicines
    const validMedicines = medicines.filter(m => m.medicine && m.dosage && m.frequency && m.duration);
    if (validMedicines.length === 0) return alert('Please add at least one complete medicine entry');
    
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/doctors/appointments/${id}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ medicines: validMedicines })
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Prescription saved and appointment completed');
      navigate('/doctor/appointments');
    } catch (err) {
      alert('Failed to save prescription');
    }
  };

  const addMedicine = () => setMedicines([...medicines, { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeMedicine = (index: number) => setMedicines(medicines.filter((_, i) => i !== index));
  const updateMedicine = (index: number, field: string, value: string) => {
    const newMeds = [...medicines];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedicines(newMeds);
  };

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading details...</div>;
  if (error || !appointment) return <div className="p-8 text-red-500 font-bold uppercase">{error || 'Appointment not found'}</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <BackButton fallback="/doctor/appointments" label="Back to Appointments" className="inline-flex items-center gap-2 font-bold uppercase text-sm hover:text-accent transition-colors" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
        <div>
          <h1 className="font-display text-3xl uppercase">{appointment.patientName}</h1>
          <div className="flex gap-4 mt-2 text-sm font-medium text-primary/70">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {appointment.date}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {appointment.startTime}</div>
          </div>
        </div>
        <span className={`px-4 py-2 font-bold uppercase tracking-wide border-2 border-primary ${appointment.status === 'CONFIRMED' ? 'bg-sage' : appointment.status === 'COMPLETED' ? 'bg-light' : 'bg-accent'}`}>
          {appointment.status}
        </span>
      </header>

      {(appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') && (
        <div className="space-y-8">
          <section className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
            <h2 className="font-display text-2xl uppercase mb-6 pb-2 border-b-2 border-primary">Consultation</h2>
            <form onSubmit={handleSaveConsultation} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Temp</label>
                  <input type="text" placeholder="e.g. 98.6 F" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} className="w-full p-2 border-2 border-primary focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">BP</label>
                  <input type="text" placeholder="e.g. 120/80" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} className="w-full p-2 border-2 border-primary focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">HR</label>
                  <input type="text" placeholder="e.g. 72 bpm" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className="w-full p-2 border-2 border-primary focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">SpO2</label>
                  <input type="text" placeholder="e.g. 98%" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} className="w-full p-2 border-2 border-primary focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-sm mb-2">Symptoms / Chief Complaint</label>
                <textarea required rows={3} value={symptoms} onChange={e => setSymptoms(e.target.value)} className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
              </div>
              
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Diagnosis</label>
                <textarea required rows={2} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
              </div>
              
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Clinical Notes</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" disabled={appointment.status === 'COMPLETED'} />
              </div>

              {appointment.status !== 'COMPLETED' && (
                <div className="flex gap-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-light font-bold uppercase hover:bg-primary/90 transition-colors">
                    Save Consultation
                  </button>
                  <button type="button" onClick={() => setShowPrescription(true)} className="px-6 py-3 bg-accent border-2 border-primary font-bold uppercase hover:bg-[#FFD13B] transition-colors">
                    Create Prescription
                  </button>
                </div>
              )}
            </form>
          </section>

          {(showPrescription || appointment.status === 'COMPLETED') && (
            <section className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]" id="prescription">
              <h2 className="font-display text-2xl uppercase mb-6 pb-2 border-b-2 border-primary">Prescription</h2>
              
              {appointment.status === 'COMPLETED' ? (
                <div className="text-primary/70 italic">Prescriptions are saved and locked for completed appointments.</div>
                // Note: to fetch saved prescriptions, we should call /api/doctors/prescriptions and filter by appointment, or update the API to return them.
              ) : (
                <div className="space-y-6">
                  {medicines.map((med, index) => (
                    <div key={index} className="p-4 bg-light border-2 border-primary relative">
                      {medicines.length > 1 && (
                        <button onClick={() => removeMedicine(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Medicine Name</label>
                          <input required placeholder="e.g. Paracetamol" value={med.medicine} onChange={e => updateMedicine(index, 'medicine', e.target.value)} className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Dosage</label>
                          <input required placeholder="e.g. 500mg" value={med.dosage} onChange={e => updateMedicine(index, 'dosage', e.target.value)} className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Frequency</label>
                          <input required placeholder="e.g. Twice daily" value={med.frequency} onChange={e => updateMedicine(index, 'frequency', e.target.value)} className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Duration</label>
                          <input required placeholder="e.g. 5 days" value={med.duration} onChange={e => updateMedicine(index, 'duration', e.target.value)} className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">Instructions (Optional)</label>
                        <input placeholder="e.g. After food" value={med.instructions} onChange={e => updateMedicine(index, 'instructions', e.target.value)} className="w-full p-3 border-2 border-primary focus:outline-none focus:border-accent" />
                      </div>
                    </div>
                  ))}
                  
                  <button onClick={addMedicine} className="flex items-center gap-2 px-4 py-2 border-2 border-primary font-bold uppercase text-sm hover:bg-light transition-colors">
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                  
                  <div className="pt-6 border-t-2 border-primary">
                    <button onClick={handleSavePrescription} className="w-full py-4 bg-accent border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors">
                      Save Prescription & Complete Appointment
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
