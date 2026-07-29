import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, FileText, ListChecks, CalendarDays,
  BarChart3, User, Settings, GraduationCap, LogOut, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/app/notes', label: 'Smart Notes', icon: FileText },
  { to: '/app/quiz', label: 'Quiz Generator', icon: ListChecks },
  { to: '/app/planner', label: 'Study Planner', icon: CalendarDays },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-72 shrink-0',
          'glass border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col',
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200/60 dark:border-slate-800/60">
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">StudySphere</span>
          </NavLink>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <NavLink to="/app/profile" onClick={onClose} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {profile?.full_name || 'Student'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">View profile</p>
            </div>
          </NavLink>
          <button
            onClick={signOut}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
