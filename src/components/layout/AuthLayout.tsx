import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, FileText, ListChecks, BarChart3 } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-bg p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg">StudySphere AI</span>
        </Link>
        <div className="relative text-white">
          <h2 className="font-display text-4xl font-bold leading-tight max-w-md">
            Your AI-powered study companion
          </h2>
          <p className="mt-4 text-white/80 max-w-md text-lg">
            Summarize notes, generate quizzes, and track your progress — all in one beautiful workspace.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: Sparkles, label: 'AI Assistant' },
              { icon: FileText, label: 'Smart Notes' },
              { icon: ListChecks, label: 'Quiz Generator' },
              { icon: BarChart3, label: 'Analytics' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/60 text-sm">© 2026 StudySphere AI</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">StudySphere AI</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-slide-up">
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
