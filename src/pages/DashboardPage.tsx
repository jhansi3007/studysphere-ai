import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Target, Clock, TrendingUp, BookOpen, Calendar, Sparkles,
  ListChecks, FileText, Award, Brain, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { BarChart, DonutChart } from '@/components/ui/Charts';
import { LoadingScreen } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { RECOMMENDATIONS } from '@/lib/ai';
import { formatRelativeTime, daysUntil } from '@/lib/utils';
import type { Activity, Exam, Note, Quiz } from '@/types';

const recommendationIcons: Record<string, React.ElementType> = {
  target: Target, flame: Flame, book: BookOpen, calendar: Calendar,
};

export function DashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [weekData, setWeekData] = useState<{ label: string; value: number }[]>([]);
  const [subjectData, setSubjectData] = useState<{ label: string; value: number; color: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [actRes, examRes, notesRes, quizRes, logsRes] = await Promise.all([
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('exams').select('*').gte('exam_date', new Date().toISOString().slice(0, 10)).order('exam_date').limit(4),
        supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('quizzes').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('study_logs').select('*').gte('log_date', new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)),
      ]);

      setActivities((actRes.data as Activity[]) || []);
      setExams((examRes.data as Exam[]) || []);
      setRecentNotes((notesRes.data as Note[]) || []);
      setRecentQuizzes((quizRes.data as Quiz[]) || []);

      const logs = logsRes.data || [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const weekArr: { label: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const mins = logs.filter((l) => l.log_date === key).reduce((s, l) => s + l.minutes, 0);
        weekArr.push({ label: days[d.getDay()], value: mins });
      }
      setWeekData(weekArr);

      const subjMap = new Map<string, number>();
      logs.forEach((l) => subjMap.set(l.subject, (subjMap.get(l.subject) || 0) + l.minutes));
      const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b'];
      const subjArr = Array.from(subjMap.entries())
        .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }))
        .slice(0, 5);
      setSubjectData(subjArr);

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen label="Loading your dashboard..." />;

  const streak = profile?.study_streak || 0;
  const productivity = profile?.productivity_score || 0;
  const totalMinutes = profile?.total_study_minutes || 0;
  const weekMinutes = weekData.reduce((s, d) => s + d.value, 0);
  const weeklyGoal = profile?.preferences?.weeklyGoal || 300;

  const activityIcons: Record<string, React.ElementType> = {
    note: FileText, quiz: ListChecks, planner: Calendar, study: Clock, achievement: Award,
  };

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Student'}`}
        subtitle="Here's your study overview for today."
        icon={<Sparkles className="h-6 w-6" />}
        action={
          <Link to="/app/assistant" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Ask AI Assistant
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Flame} label="Study Streak" value={`${streak} days`} accent="text-orange-500" bg="bg-orange-500/10" />
        <StatCard icon={Target} label="Productivity" value={`${productivity}%`} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Clock} label="Total Study" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={TrendingUp} label="This Week" value={`${Math.floor(weekMinutes / 60)}h ${weekMinutes % 60}m`} accent="text-teal-500" bg="bg-teal-500/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Study Activity This Week</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Minutes studied per day</p>
            </div>
            <Badge variant="emerald">{Math.round((weekMinutes / weeklyGoal) * 100)}% of goal</Badge>
          </div>
          <BarChart data={weekData} height={220} formatValue={(v) => `${v}m`} />
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500 dark:text-slate-400">Weekly goal</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{weekMinutes}m / {weeklyGoal}m</span>
            </div>
            <Progress value={weekMinutes} max={weeklyGoal} />
          </div>
        </Card>

        {/* Subject distribution */}
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Study by Subject</h3>
          {subjectData.length > 0 ? (
            <DonutChart data={subjectData} centerValue={`${subjectData.length}`} centerLabel="subjects" />
          ) : (
            <EmptyState icon={<BookOpen className="h-7 w-7" />} title="No data yet" description="Log study time to see your subject distribution." />
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming exams */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Upcoming Exams</h3>
            <Link to="/app/planner" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View all</Link>
          </div>
          {exams.length > 0 ? (
            <div className="space-y-3">
              {exams.map((exam) => {
                const days = daysUntil(exam.exam_date);
                return (
                  <div key={exam.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{exam.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{exam.subject}</p>
                    </div>
                    <Badge variant={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'default'}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<Calendar className="h-6 w-6" />} title="No upcoming exams" description="Add exams in the planner to track deadlines." />
          )}
        </Card>

        {/* Recent activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
          </div>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((act) => {
                const Icon = activityIcons[act.type] || Sparkles;
                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{act.title}</p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(act.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<Clock className="h-6 w-6" />} title="No activity yet" description="Your recent actions will appear here." />
          )}
        </Card>

        {/* AI recommendations */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec, i) => {
              const Icon = recommendationIcons[rec.icon] || Sparkles;
              return (
                <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{rec.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{rec.description}</p>
                      <button className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        {rec.action} <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent notes & quizzes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Notes</h3>
            <Link to="/app/notes" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View all</Link>
          </div>
          {recentNotes.length > 0 ? (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <Link key={note.id} to="/app/notes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <FileText className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{note.title}</p>
                    <p className="text-xs text-slate-400">{note.subject || 'General'} · {formatRelativeTime(note.created_at)}</p>
                  </div>
                  <Badge variant={note.status === 'summarized' ? 'success' : 'default'}>{note.status}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No notes yet" description="Upload a PDF to get an AI summary." action={<Link to="/app/notes" className="btn-primary text-sm">Add notes</Link>} />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Quizzes</h3>
            <Link to="/app/quiz" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View all</Link>
          </div>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-2">
              {recentQuizzes.map((quiz) => (
                <Link key={quiz.id} to="/app/quiz" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <ListChecks className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{quiz.title}</p>
                    <p className="text-xs text-slate-400">{quiz.total_questions} questions · {formatRelativeTime(quiz.created_at)}</p>
                  </div>
                  {quiz.score !== null && <Badge variant="success">{quiz.score}/{quiz.total_questions}</Badge>}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<ListChecks className="h-6 w-6" />} title="No quizzes yet" description="Generate a quiz from any topic." action={<Link to="/app/quiz" className="btn-primary text-sm">Create quiz</Link>} />
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, bg }: {
  icon: React.ElementType; label: string; value: string; accent: string; bg: string;
}) {
  return (
    <Card hover className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${bg} ${accent} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
