import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/assistant': 'AI Assistant',
  '/app/notes': 'Smart Notes',
  '/app/quiz': 'Quiz Generator',
  '/app/planner': 'Study Planner',
  '/app/analytics': 'Analytics',
  '/app/profile': 'Profile',
  '/app/settings': 'Settings',
};

interface BreadcrumbProps {
  showBack?: boolean;
}

export function Breadcrumb({ showBack = false }: BreadcrumbProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentLabel = routeLabels[location.pathname] || 'Page';
  const isDashboard = location.pathname === '/app/dashboard';

  return (
    <div className="flex items-center gap-3 mb-6">
      {showBack && !isDashboard && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      )}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          to="/app/dashboard"
          className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
        >
          Dashboard
        </Link>
        {!isDashboard && (
          <>
            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">{currentLabel}</span>
          </>
        )}
        {isDashboard && (
          <span className="text-slate-900 dark:text-slate-100 font-medium">{currentLabel}</span>
        )}
      </nav>
    </div>
  );
}
