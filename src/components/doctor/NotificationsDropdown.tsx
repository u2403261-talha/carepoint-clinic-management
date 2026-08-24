import React, { useState } from 'react';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = []; // Mock empty state for now as backend doesn't have a notifications table
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-light hover:text-accent transition-colors" 
        title="Notifications"
      >
        <div className="w-2 h-2 bg-accent rounded-full absolute -top-1 -right-1"></div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-primary shadow-[4px_4px_0px_0px_rgba(23,30,25,1)] z-50 text-primary">
          <div className="p-4 border-b-2 border-primary flex justify-between items-center bg-light">
            <h3 className="font-bold uppercase">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-primary hover:text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div className="p-6 text-center max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-primary/60 font-medium italic">You're all caught up.</p>
            ) : (
              <div className="space-y-4">
                {/* Render notifications here if added to backend */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
