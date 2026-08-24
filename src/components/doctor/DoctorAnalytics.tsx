import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { BarChart3 } from 'lucide-react';

export default function DoctorAnalytics() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await user?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, appsRes] = await Promise.all([
          fetch('/api/doctors/dashboard/stats', { headers }),
          fetch('/api/doctors/appointments', { headers })
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (appsRes.ok) setApps(await appsRes.json());
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    if (profile) fetchData();
  }, [profile]);

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading analytics...</div>;

  const total = apps.length;
  const completed = apps.filter(a => a.status === 'COMPLETED').length;
  const cancelled = apps.filter(a => a.status === 'CANCELLED' || a.status === 'REJECTED').length;
  
  // Calculate appointments by day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  let maxDayCount = 0;
  
  apps.forEach(a => {
    const d = new Date(a.date).getDay();
    dayCounts[d]++;
    if (dayCounts[d] > maxDayCount) maxDayCount = dayCounts[d];
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="font-display text-4xl uppercase">Analytics</h1>
        <p className="text-primary/60 mt-2 font-medium">Insights into your practice.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-primary p-6 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="font-bold text-primary/60 text-sm mb-2">TOTAL APPOINTMENTS</div>
          <div className="font-display text-4xl">{total}</div>
        </div>
        <div className="bg-white border-2 border-primary p-6 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="font-bold text-primary/60 text-sm mb-2">COMPLETED</div>
          <div className="font-display text-4xl text-sage">{completed}</div>
        </div>
        <div className="bg-white border-2 border-primary p-6 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="font-bold text-primary/60 text-sm mb-2">CANCELLED/REJECTED</div>
          <div className="font-display text-4xl text-red-500">{cancelled}</div>
        </div>
        <div className="bg-white border-2 border-primary p-6 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="font-bold text-primary/60 text-sm mb-2">TOTAL PATIENTS</div>
          <div className="font-display text-4xl text-accent">{stats?.totalPatients || 0}</div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border-2 border-primary p-8 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <h2 className="font-display text-2xl uppercase mb-8">Appointments By Day</h2>
          <div className="space-y-4">
            {days.map((day, i) => (
              <div key={day}>
                <div className="flex justify-between font-bold text-xs uppercase mb-1 text-primary/70">
                  <span>{day}</span>
                  <span>{dayCounts[i]}</span>
                </div>
                <div className="h-6 w-full bg-light border-2 border-primary overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: maxDayCount > 0 ? `${(dayCounts[i] / maxDayCount) * 100}%` : '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-primary p-8 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <h2 className="font-display text-2xl uppercase mb-8">Status Breakdown</h2>
          <div className="space-y-6">
            {[
              { label: 'Completed', count: completed, color: 'bg-sage' },
              { label: 'Pending', count: stats?.pendingAppointments || 0, color: 'bg-accent' },
              { label: 'Confirmed', count: stats?.confirmedAppointments || 0, color: 'bg-primary' },
              { label: 'Cancelled/Rejected', count: cancelled, color: 'bg-red-400' }
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between font-bold text-sm uppercase mb-2">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-4 w-full bg-light border-2 border-primary overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: total > 0 ? `${(item.count / total) * 100}%` : '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
