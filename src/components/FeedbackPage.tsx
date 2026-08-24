import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';
import { Footer } from './ui/Footer';
import BackButton from './ui/BackButton';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function FeedbackPage() {
  const { user, profile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || user?.email || '',
    userType: profile?.role === 'PATIENT' ? 'Patient' : profile?.role === 'DOCTOR' ? 'Doctor' : 'Other',
    category: 'General Feedback',
    rating: '5',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        rating: parseInt(formData.rating, 10),
        uid: user?.uid || null,
        status: 'NEW',
        createdAt: serverTimestamp()
      });
      setStatus('success');
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <nav className="relative z-50 border-b border-primary/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-4">
             <BackButton className="font-bold uppercase text-primary hover:text-primary/70 transition-colors" />
          </div>
        </div>
      </nav>

      <main className="flex-1 py-16 px-6">
        <div className="max-w-2xl mx-auto bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
          <h1 className="font-display text-4xl uppercase mb-4">Help Us Improve CarePoint</h1>
          <p className="text-primary/70 mb-8 pb-6 border-b-2 border-primary/10">
            Your feedback helps improve the CarePoint platform.
          </p>
          
          {status === 'success' ? (
            <div className="p-8 bg-sage border-2 border-primary text-center">
              <h3 className="font-display text-2xl uppercase mb-2">Thank you!</h3>
              <p className="font-medium">Thank you for your feedback.</p>
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, message: '' }));
                  setStatus('idle');
                }}
                className="mt-6 px-6 py-3 bg-white border-2 border-primary font-bold uppercase text-sm hover:bg-light transition-colors"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-100 text-red-600 border-2 border-red-500 font-bold">
                  {errorMsg}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    required
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">User Type</label>
                  <select 
                    name="userType" 
                    value={formData.userType} 
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase text-primary mb-2">Feedback Category</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="UI/Design">UI/Design</option>
                    <option value="Performance">Performance</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-primary mb-2">Rating</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating" 
                        value={star.toString()} 
                        checked={formData.rating === star.toString()}
                        onChange={handleChange}
                        className="w-4 h-4 text-accent border-2 border-primary"
                      />
                      <span className="font-bold">{star} Star{star !== 1 ? 's' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-primary mb-2">Message</label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Please describe your feedback..."
                  className="w-full p-3 border-2 border-primary bg-light focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full py-4 bg-accent text-primary border-2 border-primary font-bold uppercase tracking-wide hover:bg-[#FFD13B] transition-colors disabled:opacity-70"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
