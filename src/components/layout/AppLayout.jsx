import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, DollarSign, Map, LogOut, Compass } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BG_URL = 'https://media.base44.com/images/public/6a53861a2910b26589bc1897/6074d1e88_generated_image.png';

const tabs = [
  { path: '/', label: 'Calendar', icon: Calendar },
  { path: '/prices', label: 'Prices', icon: DollarSign },
  { path: '/map', label: 'Map & Transport', icon: Map },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Soft gradient background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 p-4">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-soft">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">TripBudget</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 mt-6">
          {tabs.map(t => {
            const active = t.path === '/' ? pathname === '/' : pathname.startsWith(t.path);
            return (
              <Link
                key={t.path}
                to={t.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active ? 'bg-card shadow-soft text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
              >
                <t.icon className="w-5 h-5" />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => base44.auth.logout('/')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-card/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden h-14 shrink-0 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-soft">
            <Compass className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold">TripBudget</span>
        </div>
        <button
          onClick={() => base44.auth.logout('/')}
          className="w-9 h-9 rounded-full bg-card/70 backdrop-blur border border-border/60 flex items-center justify-center text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden p-2 md:p-4">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden sticky bottom-0 mx-3 mb-3 bg-card/80 backdrop-blur rounded-full p-1 shadow-soft-lg border border-border/60 flex z-50">
        {tabs.map(t => {
          const active = t.path === '/' ? pathname === '/' : pathname.startsWith(t.path);
          return (
            <Link
              key={t.path}
              to={t.path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-full text-xs font-semibold transition-all
                ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}