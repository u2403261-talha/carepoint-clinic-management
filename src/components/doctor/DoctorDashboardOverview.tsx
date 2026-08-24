import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Calendar, CheckCircle, Clock, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorDashboardOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [todayApps, setTodayApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await user?.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [statsRes, appsRes] = await Promise.all([
          fetch('/api/doctors/dashboard/stats', { headers }),
          fetch('/api/doctors/appointments', { headers })
        ]);
        
        if (!statsRes.ok || !appsRes.ok) throw new Error('Failed to fetch data');
        
        const statsData = await statsRes.json();
        const appsData = await appsRes.json();
        
        setStats(statsData);
        
        const today = new Date().toISOString().split('T')[0];
        setTodayApps(appsData.filter((a: any) => a.date === today));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    if (profile) fetchData();
  }, [profile]);

  if (loading) return <div className="p-8 font-bold uppercase animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold uppercase">{error}</div>;

  const nextApp = todayApps.find(a => a.status === 'CONFIRMED' && a.startTime >= new Date().toTimeString().substring(0, 5));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="font-display text-4xl uppercase">Good morning, Dr. {profile?.name?.split(' ').pop()}</h1>
        <p className="text-primary/60 mt-2 font-medium">Here's an overview of your practice today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-accent" />
            <span className="font-bold uppercase text-sm">Today</span>
          </div>
          <div className="font-display text-4xl">{stats.todayAppointments}</div>
        </div>
        <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-accent" />
            <span className="font-bold uppercase text-sm">Pending</span>
          </div>
          <div className="font-display text-4xl">{stats.pendingAppointments}</div>
        </div>
        <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-sage" />
            <span className="font-bold uppercase text-sm">Completed</span>
          </div>
          <div className="font-display text-4xl">{stats.completedAppointments}</div>
        </div>
        <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-accent" />
            <span className="font-bold uppercase text-sm">Patients</span>
          </div>
          <div className="font-display text-4xl">{stats.totalPatients}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl uppercase">Today's Schedule</h2>
            <Link to="/doctor/appointments" className="font-bold uppercase text-sm underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors">View All</Link>
          </div>
          
          {todayApps.length === 0 ? (
            <div className="bg-white border-2 border-primary p-8 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
              <p className="font-bold uppercase text-primary/60">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayApps.map(app => (
                <div key={app.id} className="bg-white border-2 border-primary p-4 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 font-display text-xl">{app.startTime}</div>
                    <div>
                      <div className="font-bold uppercase">{app.patientName}</div>
                      <div className="text-sm text-primary/70">{app.reason || 'General Consultation'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-sage/20 font-bold text-xs uppercase">{app.status}</span>
                    <Link to={`/doctor/appointments/${app.id}`} className="p-2 border-2 border-primary hover:bg-accent transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl uppercase mb-4">Next Appointment</h2>
            {nextApp ? (
              <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                <div className="font-display text-3xl text-accent mb-2">{nextApp.startTime}</div>
                <div className="font-bold uppercase text-lg mb-1">{nextApp.patientName}</div>
                <div className="text-sm text-primary/70 mb-4">{nextApp.reason}</div>
                <Link to={`/doctor/appointments/${nextApp.id}`} className="block w-full py-3 bg-accent border-2 border-primary font-bold uppercase text-center hover:bg-[#FFD13B] transition-colors">
                  Start Consultation
                </Link>
              </div>
            ) : (
              <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                <p className="font-bold uppercase text-primary/60 text-sm">No upcoming appointments today.</p>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="font-display text-xl uppercase mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/doctor/schedule" className="block w-full py-3 px-4 bg-white border-2 border-primary font-bold uppercase text-sm hover:bg-light transition-colors flex justify-between items-center">
                Manage Schedule <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/doctor/patients" className="block w-full py-3 px-4 bg-white border-2 border-primary font-bold uppercase text-sm hover:bg-light transition-colors flex justify-between items-center">
                Patient Directory <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
