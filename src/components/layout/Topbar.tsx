import { Menu, Search, Bell, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, cn } from '@/lib/utils';
import { NavLink, useLocation } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/app/dashboard';

  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-slate-200/60 dark:border-slate-800/60 px-4 lg:px-8 flex items-center gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </button>

      <NavLink
        to="/app/dashboard"
        aria-label="Go to Dashboard"
        className={cn(
          'p-2 rounded-xl transition-colors shrink-0',
          isDashboard
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        <LayoutDashboard className="h-5 w-5" />
      </NavLink>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, quizzes, tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-transparent focus:border-emerald-500/40 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        </button>
        <ThemeToggle />
        <NavLink to="/app/profile" className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(profile?.full_name)}
        </NavLink>
      </div>
    </header>
  );
}
