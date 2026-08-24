import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';
import { Footer } from './ui/Footer';
import BackButton from './ui/BackButton';

export default function CopyrightPage() {
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
        <div className="max-w-3xl mx-auto bg-white border-2 border-primary p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(23,30,25,1)]">
          <h1 className="font-display text-4xl uppercase mb-8 border-b-2 border-primary/10 pb-6">Copyright Notice</h1>
          
          <div className="prose prose-lg text-primary max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-primary">
            <p className="font-bold mb-8">&copy; 2026 CarePoint. All rights reserved.</p>

            <p>The CarePoint name, logo, website design, interface, original graphics, source code, documentation, and other original content created for this project are protected to the extent applicable under copyright and other intellectual-property laws.</p>

            <p>Unless permission is provided, users may not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Copy substantial portions of the website</li>
              <li>Reproduce the CarePoint branding or logo</li>
              <li>Redistribute the application's source code</li>
              <li>Republish original website content as their own</li>
              <li>Modify and redistribute proprietary project materials without permission</li>
            </ul>

            <p>Third-party libraries, frameworks, icons, fonts, and other resources remain subject to their respective licenses.</p>
            
            <p>Nothing on this page claims ownership over third-party software or content.</p>

            <p>For questions regarding use of CarePoint materials, contact the project owner/administrator.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
