import { Link } from 'react-router-dom';
import {
  GraduationCap, Sparkles, FileText, ListChecks, CalendarDays, BarChart3,
  ArrowRight, Check, Star, Zap, Brain, Clock, Trophy, Users,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  { icon: Sparkles, title: 'AI Study Assistant', desc: 'Chat with an AI tutor that explains concepts, generates practice problems, and adapts to your learning style.' },
  { icon: FileText, title: 'Smart Notes', desc: 'Upload PDFs and get instant AI-generated summaries with key points highlighted for faster revision.' },
  { icon: ListChecks, title: 'Quiz Generator', desc: 'Turn any topic into a custom quiz with multiple-choice questions, explanations, and instant scoring.' },
  { icon: CalendarDays, title: 'Study Planner', desc: 'Plan your study sessions on a calendar, set priorities, and track completion to stay on schedule.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Visualize study time, productivity trends, and subject mastery with beautiful charts.' },
  { icon: Brain, title: 'AI Recommendations', desc: 'Get personalized study suggestions based on your activity, scores, and upcoming deadlines.' },
];

const stats = [
  { value: '50K+', label: 'Students' },
  { value: '1.2M+', label: 'Notes summarized' },
  { value: '340K+', label: 'Quizzes generated' },
  { value: '4.9/5', label: 'Average rating' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Pre-med Student', text: 'StudySphere completely changed how I revise. The AI summaries save me hours before every exam.', avatar: 'SC' },
  { name: 'Marcus Johnson', role: 'CS Major', text: 'The quiz generator is unreal. I plug in a topic and get a full practice test in seconds.', avatar: 'MJ' },
  { name: 'Priya Patel', role: 'Graduate Researcher', text: 'The analytics keep me honest about my study habits. My productivity score actually went up.', avatar: 'PP' },
];

const plans = [
  {
    name: 'Free', price: '$0', period: 'forever',
    features: ['50 AI chat messages / month', '5 note summaries / month', 'Basic analytics', 'Study planner'],
    cta: 'Get started', highlight: false,
  },
  {
    name: 'Pro', price: '$12', period: '/month',
    features: ['Unlimited AI chat', 'Unlimited note summaries', 'Advanced analytics', 'Priority quiz generation', 'Export to PDF', 'Email reminders'],
    cta: 'Start free trial', highlight: true,
  },
  {
    name: 'Team', price: '$29', period: '/month',
    features: ['Everything in Pro', 'Up to 10 members', 'Shared study sets', 'Group analytics', 'Admin dashboard'],
    cta: 'Contact us', highlight: false,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen mesh-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">StudySphere AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get started <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            AI-powered learning, built for students
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1] animate-slide-up">
            Study smarter with your <span className="gradient-text">personal AI tutor</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto animate-slide-up">
            Summarize notes, generate quizzes, plan your study schedule, and track your progress — all in one beautiful workspace powered by AI.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/signup" className="btn-primary text-base px-6 py-3.5">
              Start studying free <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#features" className="btn-outline text-base px-6 py-3.5">Explore features</a>
          </div>
          <div className="mt-16 relative animate-scale-in">
            <div className="glass-card p-2 max-w-5xl mx-auto shadow-2xl shadow-emerald-500/10">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 aspect-[16/9] flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 w-full h-full">
                  {[
                    { icon: Sparkles, label: 'AI Chat', color: 'text-emerald-500' },
                    { icon: FileText, label: 'Notes', color: 'text-teal-500' },
                    { icon: ListChecks, label: 'Quizzes', color: 'text-cyan-500' },
                    { icon: BarChart3, label: 'Analytics', color: 'text-blue-500' },
                  ].map((f, i) => (
                    <div key={i} className="glass-card flex flex-col items-center justify-center gap-3 p-6 hover:-translate-y-1 transition-transform">
                      <f.icon className={`h-8 w-8 ${f.color}`} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200/60 dark:border-slate-800/60 glass">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl lg:text-4xl font-bold gradient-text">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white">Everything you need to ace your studies</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Six powerful tools working together in one seamless workspace.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 glass border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white">How it works</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Three steps to a better study routine.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, step: '01', title: 'Create your account', desc: 'Sign up free in seconds. No credit card required.' },
              { icon: FileText, step: '02', title: 'Add your material', desc: 'Upload notes, paste text, or pick a topic to study.' },
              { icon: Trophy, step: '03', title: 'Let AI do the work', desc: 'Get summaries, quizzes, and a personalized plan instantly.' },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                  <s.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm font-mono text-emerald-500 font-bold mb-2">{s.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white">Loved by students worldwide</h2>
            <div className="mt-4 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">4.9 out of 5 from 2,800+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 glass border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <div key={i} className={`glass-card p-8 relative ${p.highlight ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]' : ''}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-slate-900 dark:text-white">{p.price}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`mt-8 w-full ${p.highlight ? 'btn-primary' : 'btn-outline'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="relative rounded-3xl gradient-bg p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
            <div className="relative">
              <Clock className="h-12 w-12 text-white mx-auto mb-4" />
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Ready to study smarter?</h2>
              <p className="mt-3 text-lg text-white/90 max-w-xl mx-auto">Join 50,000+ students using StudySphere AI to learn faster and retain more.</p>
              <Link to="/signup" className="mt-8 inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-white/90 transition-colors">
                Create your free account <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-slate-900 dark:text-white">StudySphere AI</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="#features" className="hover:text-emerald-600">Features</a>
              <a href="#pricing" className="hover:text-emerald-600">Pricing</a>
              <Link to="/login" className="hover:text-emerald-600">Sign in</Link>
            </div>
            <p className="text-sm text-slate-400">© 2026 StudySphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
