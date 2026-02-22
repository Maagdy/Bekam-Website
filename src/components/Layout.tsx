import type { ReactNode } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import InstallPrompt from './InstallPrompt';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-surface-50))' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 animate-fade-in">
        {children}
      </main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
