import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Calendar, Clock, X } from 'lucide-react';

export default function DoctorSchedule() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotDuration, setSlotDuration] = useState('20');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  
  const [newBlockDate, setNewBlockDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${await user?.getIdToken()}` }
        });
        const data = await res.json();
        const doc = data.doctorProfile;
        if (doc) {
          setWorkingDays(doc.workingDays ? doc.workingDays.split(',') : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
          setStartTime(doc.startTime || '09:00');
          setEndTime(doc.endTime || '17:00');
          setSlotDuration((doc.slotDuration || 20).toString());
          setBlockedDates(doc.blockedDates ? doc.blockedDates.split(',').filter((d: string) => d) : []);
        }
      } catch (err) {
        setError('Failed to load schedule configuration');
      } finally {
        setLoading(false);
      }
    };
    if (profile) fetchProfile();
  }, [profile]);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddBlockDate = () => {
    if (!newBlockDate) return;
    if (blockedDates.includes(newBlockDate)) return;
    setBlockedDates([...blockedDates, newBlockDate]);
    setNewBlockDate('');
  };

  const removeBlockDate = (date: string) => {
    setBlockedDates(blockedDates.filter(d => d !== date));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/doctors/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          workingDays: workingDays.join(','),
          startTime,
          endTime,
          slotDuration,
          blockedDates: blockedDates.join(',')
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Schedule updated successfully');
    } catch (err) {
      alert('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading schedule...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold uppercase">{error}</div>;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="font-display text-4xl uppercase">Schedule Management</h1>
        <p className="text-primary/60 mt-2 font-medium">Configure your working hours and availability.</p>
      </header>

      <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
        <form onSubmit={handleSave} className="space-y-8">
          <div>
            <h3 className="font-bold uppercase text-lg mb-4 flex items-center gap-2 border-b-2 border-primary pb-2"><Calendar className="w-5 h-5" /> Working Days</h3>
            <div className="flex flex-wrap gap-3">
              {days.map(day => (
                <label key={day} className={`px-4 py-2 border-2 cursor-pointer transition-colors font-bold uppercase text-sm ${workingDays.includes(day) ? 'bg-primary text-light border-primary' : 'bg-white border-primary/20 text-primary hover:border-primary'}`}>
                  <input type="checkbox" checked={workingDays.includes(day)} onChange={() => toggleDay(day)} className="hidden" />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase text-lg mb-4 flex items-center gap-2 border-b-2 border-primary pb-2"><Clock className="w-5 h-5" /> Working Hours</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Start Time</label>
                <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block font-bold uppercase text-sm mb-2">End Time</label>
                <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Slot Duration</label>
                <select value={slotDuration} onChange={e => setSlotDuration(e.target.value)} className="w-full p-3 border-2 border-primary bg-light focus:outline-none focus:border-accent">
                  <option value="15">15 Minutes</option>
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase text-lg mb-4 flex items-center gap-2 border-b-2 border-primary pb-2"><Calendar className="w-5 h-5" /> Block / Unavailable Dates</h3>
            <p className="text-sm text-primary/70 mb-4 font-medium">Patients will not be able to book appointments on these dates. Existing appointments are not deleted.</p>
            
            <div className="flex gap-4 mb-4">
              <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} className="flex-1 p-3 border-2 border-primary focus:outline-none focus:border-accent" />
              <button type="button" onClick={handleAddBlockDate} className="px-6 bg-accent border-2 border-primary font-bold uppercase text-sm hover:bg-[#FFD13B] transition-colors">
                Add Date
              </button>
            </div>
            
            {blockedDates.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {blockedDates.map(date => (
                  <div key={date} className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-900 border-2 border-red-900 font-bold text-sm">
                    {date}
                    <button type="button" onClick={() => removeBlockDate(date)} className="hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t-2 border-primary">
            <button type="submit" disabled={saving} className="w-full md:w-auto px-10 py-4 bg-primary text-light font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
