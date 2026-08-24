import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Users, UserCheck, Activity, LogOut, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import DeleteAccountSection from './DeleteAccountSection';

export default function AdminDashboard() {
  const { profile, logOut } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const getTab = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'patients') return 'patients';
    if (path === 'doctors') return 'allDoctors';
    if (path === 'pending') return 'doctors';
    if (path === 'departments') return 'departments';
    if (path === 'deleted') return 'deleted';
    if (path === 'settings') return 'settings';
    return 'overview';
  };
  
  const activeTab = getTab();
  
  const setActiveTab = (tab) => {
    if (tab === 'overview') navigate('/admin/dashboard');
    else if (tab === 'patients') navigate('/admin/patients');
    else if (tab === 'allDoctors') navigate('/admin/doctors');
    else if (tab === 'doctors') navigate('/admin/pending');
    else if (tab === 'departments') navigate('/admin/departments');
    else if (tab === 'deleted') navigate('/admin/deleted');
    else if (tab === 'settings') navigate('/admin/settings');
  };

  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [deletedAccounts, setDeletedAccounts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchData = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (activeTab === 'doctors') {
        const res = await fetch('/api/admin/doctors/pending', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setPendingDoctors(await res.json());
      } else if (activeTab === 'patients') {
        const res = await fetch('/api/admin/patients', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setPatients(await res.json());
      } else if (activeTab === 'allDoctors') {
        const res = await fetch('/api/admin/doctors', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAllDoctors(await res.json());
      } else if (activeTab === 'overview') {
        const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setStats(await res.json());
      } else if (activeTab === 'departments') {
        const res = await fetch('/api/departments');
        if (res.ok) setDepartments(await res.json());
      } else if (activeTab === 'deleted') {
        const res = await fetch('/api/admin/deleted-accounts', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setDeletedAccounts(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/doctors/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Doctor approved!');
        fetchData();
      } else {
        const errorText = await res.text();
        alert('Error approving doctor: ' + errorText);
      }
    } catch (e) {
      alert('Error approving doctor');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: formData.get('name') })
      });
      if (res.ok) {
        e.currentTarget.reset();
        fetchData();
      } else {
        alert('Failed to add department');
      }
    } catch (err) {
      alert('Error adding department');
    }
  };
  
  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-primary text-white border-r border-primary/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="font-display text-2xl uppercase flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
            Admin Portal
          </div>
        </div>
        <div className="p-6 flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'overview' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Activity className="w-5 h-5" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'patients' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Users className="w-5 h-5" /> Patients
          </button>
          <button 
            onClick={() => setActiveTab('allDoctors')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'allDoctors' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Users className="w-5 h-5" /> Doctors
          </button>
          <button 
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'doctors' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <UserCheck className="w-5 h-5" /> Pending Approvals
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'departments' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Users className="w-5 h-5" /> Departments
          </button>
          <button 
            onClick={() => setActiveTab('deleted')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'deleted' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Users className="w-5 h-5" /> Deleted Accounts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-colors ${activeTab === 'settings' ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </div>
        <div className="p-6 border-t border-white/10">
          <div className="mb-4 font-medium truncate text-white/70">{profile.name} (Admin)</div>
          <button onClick={logOut} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="font-display text-4xl uppercase border-b-2 border-primary pb-4">
            {activeTab === 'overview' && 'Clinic Overview'}
            {activeTab === 'patients' && 'Patients'}
            {activeTab === 'allDoctors' && 'Doctors'}
            {activeTab === 'doctors' && 'Pending Approvals'}
            {activeTab === 'departments' && 'Manage Departments'}
            {activeTab === 'deleted' && 'Deleted Accounts'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/60 mb-2">Total Patients</div>
                  <div className="font-display text-5xl">{stats.totalPatients}</div>
                </div>
                <div className="bg-accent border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/80 mb-2">Active Doctors</div>
                  <div className="font-display text-5xl">{stats.activeDoctors}</div>
                </div>
                <div className="bg-sage border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/80 mb-2">Pending Approvals</div>
                  <div className="font-display text-5xl">{stats.pendingDoctors}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/60 mb-2">Today's Appointments</div>
                  <div className="font-display text-4xl">{stats.todayAppointments}</div>
                </div>
                <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/60 mb-2">Total Appointments</div>
                  <div className="font-display text-4xl">{stats.totalAppointments}</div>
                </div>
                <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/60 mb-2">Completed</div>
                  <div className="font-display text-4xl">{stats.completedAppointments}</div>
                </div>
                <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <div className="text-sm font-bold uppercase text-primary/60 mb-2">Deleted Accounts</div>
                  <div className="font-display text-4xl">{stats.deletedAccounts}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'allDoctors' && (
            <div className="space-y-6">
              <div className="overflow-x-auto bg-white border-2 border-primary shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-light border-b-2 border-primary uppercase text-sm">
                      <th className="p-4 font-bold">Name</th>
                      <th className="p-4 font-bold">Email</th>
                      <th className="p-4 font-bold">Specialization</th>
                      <th className="p-4 font-bold">Registered</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDoctors.map(doc => (
                      <tr key={doc.id} className="border-b border-primary/20 hover:bg-light transition-colors">
                        <td className="p-4 font-medium">{doc.name}</td>
                        <td className="p-4">{doc.email}</td>
                        <td className="p-4">{doc.specialization}</td>
                        <td className="p-4 text-sm text-primary/70">{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${doc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="overflow-x-auto bg-white border-2 border-primary shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-light border-b-2 border-primary uppercase text-sm">
                      <th className="p-4 font-bold">Name</th>
                      <th className="p-4 font-bold">Email</th>
                      <th className="p-4 font-bold">Registered</th>
                      <th className="p-4 font-bold">Appointments</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.id} className="border-b border-primary/20 hover:bg-light transition-colors">
                        <td className="p-4 font-medium">{patient.name}</td>
                        <td className="p-4">{patient.email}</td>
                        <td className="p-4 text-sm text-primary/70">{new Date(patient.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">{patient.appointmentsCount}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${patient.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
                <h2 className="font-display text-2xl uppercase mb-6">Add New Department</h2>
                <form onSubmit={handleAddDepartment} className="flex gap-4 max-w-xl">
                  <input name="name" required placeholder="Department Name" className="flex-1 p-4 border-2 border-primary bg-light focus:outline-none focus:border-accent" />
                  <button type="submit" className="px-8 py-4 bg-accent text-primary border-2 border-primary font-bold uppercase hover:bg-[#FFD13B]">
                    Add
                  </button>
                </form>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {departments.map(d => (
                  <div key={d.id} className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)] flex items-center justify-between">
                    <div className="font-display text-xl uppercase">{d.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="space-y-6">
              {pendingDoctors.length === 0 ? (
                <div className="bg-white border-2 border-primary p-10 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <p className="text-primary/60 font-medium text-lg">No pending doctors for approval.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {pendingDoctors.map(doc => (
                    <div key={doc.id} className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                      <div className="font-display text-2xl uppercase mb-2">{doc.name}</div>
                      <div className="text-primary/70 mb-4">{doc.specialization} • {doc.qualification}</div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="text-sm"><strong>Experience:</strong> {doc.experience} years</div>
                        <div className="text-sm"><strong>Reg. No:</strong> {doc.registrationNumber}</div>
                        <div className="text-sm"><strong>Email:</strong> {doc.email}</div>
                      </div>
                      
                      <button 
                        onClick={() => handleApprove(doc.id)}
                        className="w-full px-4 py-3 bg-accent border-2 border-primary font-bold uppercase hover:bg-[#FFD13B] transition-colors"
                      >
                        Approve Doctor
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'deleted' && (
            <div className="space-y-6">
              {deletedAccounts.length === 0 ? (
                <div className="bg-white border-2 border-primary p-10 text-center shadow-[4px_4px_0px_0px_rgba(23,30,25,1)]">
                  <p className="text-primary/60 font-medium text-lg">No deleted accounts.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border-2 border-primary shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-light border-b-2 border-primary uppercase text-sm">
                        <th className="p-4 font-bold">Name</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Registered</th>
                        <th className="p-4 font-bold">Deleted</th>
                        <th className="p-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedAccounts.map(acc => (
                        <tr key={acc.id} className="border-b border-primary/20 hover:bg-light transition-colors">
                          <td className="p-4 font-medium">{acc.name}</td>
                          <td className="p-4">{acc.role}</td>
                          <td className="p-4 text-sm text-primary/70">{new Date(acc.registeredAt).toLocaleDateString()}</td>
                          <td className="p-4 text-sm text-primary/70">{new Date(acc.deletedAt).toLocaleDateString()}</td>
                          <td className="p-4"><span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">DELETED</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="font-display text-3xl uppercase mb-6">Account Settings</h2>
              <div className="bg-white border-2 border-primary p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
                <h3 className="font-bold uppercase text-lg mb-4">Profile Information</h3>
                <div className="space-y-2 mb-8">
                  <p><span className="font-medium text-primary/60">Name:</span> {profile.name}</p>
                  <p><span className="font-medium text-primary/60">Email:</span> {profile.email}</p>
                  <p><span className="font-medium text-primary/60">Role:</span> {profile.role}</p>
                </div>
              </div>
              <DeleteAccountSection />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
