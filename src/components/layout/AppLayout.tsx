import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { MoreSheet } from './MoreSheet';

/** App shell: desktop sidebar + mobile top bar/bottom nav + routed content. */
export function AppLayout({ children }: { children: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar onMore={() => setMoreOpen(true)} />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </div>
      </main>
      <BottomNav onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
