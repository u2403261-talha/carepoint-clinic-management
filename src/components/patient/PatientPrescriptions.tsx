import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Calendar, Pill } from 'lucide-react';
import { auth } from '../../lib/firebase';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/patient/prescriptions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setPrescriptions(await res.json());
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <div className="font-bold uppercase animate-pulse">Loading prescriptions...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6">My Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <div className="bg-white border-2 border-primary p-10 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <p className="text-primary/60 font-medium text-lg">No prescriptions found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map(rx => (
            <div key={rx.id} className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="font-display text-2xl uppercase mb-1">{rx.doctorName}</div>
                  <div className="flex items-center gap-2 text-primary/70 font-medium text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(rx.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <div className="bg-light p-6 border-2 border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-6 h-6 text-accent" />
                  <h3 className="font-display text-xl uppercase">{rx.medicine}</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs font-bold uppercase text-primary/50 mb-1">Dosage</div>
                    <div className="font-medium">{rx.dosage}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-primary/50 mb-1">Frequency</div>
                    <div className="font-medium">{rx.frequency}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-primary/50 mb-1">Duration</div>
                    <div className="font-medium">{rx.duration}</div>
                  </div>
                </div>
                
                {rx.instructions && (
                  <div className="mt-6 pt-4 border-t border-primary/10">
                    <div className="text-xs font-bold uppercase text-primary/50 mb-1">Instructions</div>
                    <div className="font-medium">{rx.instructions}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
