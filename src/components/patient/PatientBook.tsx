import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';

export default function PatientBook() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors');
        if (res.ok) setDoctors(await res.json());
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableSlots([]);
        return;
      }
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/doctors/${selectedDoctor.id}/availability?date=${selectedDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (e) {
        setAvailableSlots([]);
      }
    };
    fetchAvailability();
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!selectedDoctor || !selectedDate || !selectedTime) { setIsSubmitting(false); return; }
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: selectedDate,
          startTime: selectedTime,
          reason
        })
      });
      
      if (res.ok) {
        alert('Appointment booked successfully!');
        navigate('/patient/dashboard');
        setIsSubmitting(false);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to book');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('Error booking appointment');
      setIsSubmitting(false);
    }
  };

  if (loading && doctors.length === 0) return <div className="font-bold uppercase animate-pulse">Loading doctors...</div>;

  return (
    <div>
      {!selectedDoctor ? (
        <div className="space-y-6">
          <h2 className="font-display text-3xl uppercase">Select a Doctor</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <button 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className="text-left p-6 border-2 border-primary/10 hover:border-accent transition-colors bg-light focus:outline-none"
              >
                <div className="font-bold text-xl">{doc.name}</div>
                <div className="text-primary/70 mb-2">{doc.specialization}</div>
                <div className="text-sm text-primary/50">{doc.experience} years exp.</div>
              </button>
            ))}
            {doctors.length === 0 && (
              <div className="col-span-2 text-primary/50">No doctors available.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 max-w-2xl">
          <button 
            onClick={() => {
              setSelectedDoctor(null);
              setSelectedDate('');
              setSelectedTime('');
            }}
            className="text-sm font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-wider"
          >
            ← Back to Doctors
          </button>
          
          <div className="pb-6 border-b border-primary/10">
            <h2 className="font-display text-3xl uppercase">{selectedDoctor.name}</h2>
            <div className="text-lg text-primary/70">{selectedDoctor.specialization}</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block font-bold uppercase text-sm">Select Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent"
              />
            </div>
            
            <div className="space-y-4">
              <label className="block font-bold uppercase text-sm">Select Time</label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 border-2 text-center font-medium transition-colors ${selectedTime === time ? 'border-primary bg-primary text-white' : 'border-primary/10 hover:border-primary/30 bg-light'}`}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-primary/50 p-3 bg-light border-2 border-primary/10">
                    {!selectedDoctor.startTime && !selectedDoctor.workingDays ? 
                      "Doctor schedule not configured." : 
                      (!selectedDate ? "Please select a date first" : "No slots available")
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block font-bold uppercase text-sm">Reason for Visit (Optional)</label>
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent"
              placeholder="Briefly describe your symptoms..."
            />
          </div>

          <div className="pt-6">
            <button 
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime}
              className="w-full md:w-auto px-8 py-4 bg-accent text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors disabled:opacity-50"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
