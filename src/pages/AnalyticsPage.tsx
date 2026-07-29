import { useEffect, useState } from 'react';
import {
  BarChart3, Clock, Target, TrendingUp, Award, BookOpen, Flame,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { BarChart, LineChart, DonutChart } from '@/components/ui/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function AnalyticsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<{ label: string; value: number }[]>([]);
  const [monthData, setMonthData] = useState<{ label: string; value: number }[]>([]);
  const [subjectData, setSubjectData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [quizStats, setQuizStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  const [noteStats, setNoteStats] = useState({ total: 0, summarized: 0 });
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const monthAgo = new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);

      const [logsRes, quizRes, noteRes, taskRes] = await Promise.all([
        supabase.from('study_logs').select('*').gte('log_date', monthAgo),
        supabase.from('quizzes').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('planner_tasks').select('*'),
      ]);

      const logs = (logsRes.data as { log_date: string; subject: string; minutes: number }[]) || [];
      const quizzes = (quizRes.data as { score: number | null; total_questions: number }[]) || [];
      const notes = (noteRes.data as { status: string }[]) || [];
      const tasks = (taskRes.data as { status: string }[]) || [];

      setHasData(logs.length > 0 || quizzes.length > 0 || notes.length > 0 || tasks.length > 0);

      // Week data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekArr: { label: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const mins = logs.filter((l) => l.log_date === key).reduce((s, l) => s + l.minutes, 0);
        weekArr.push({ label: days[d.getDay()], value: mins });
      }
      setWeekData(weekArr);

      // Month data (weekly buckets)
      const monthArr: { label: string; value: number }[] = [];
      for (let w = 3; w >= 0; w--) {
        const start = new Date(today);
        start.setDate(start.getDate() - w * 7 - 6);
        const end = new Date(today);
        end.setDate(end.getDate() - w * 7);
        const startKey = start.toISOString().slice(0, 10);
        const endKey = end.toISOString().slice(0, 10);
        const mins = logs.filter((l) => l.log_date >= startKey && l.log_date <= endKey).reduce((s, l) => s + l.minutes, 0);
        monthArr.push({ label: `Wk ${4 - w}`, value: mins });
      }
      setMonthData(monthArr);

      // Subject distribution
      const subjMap = new Map<string, number>();
      logs.forEach((l) => subjMap.set(l.subject, (subjMap.get(l.subject) || 0) + l.minutes));
      const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
      setSubjectData(
        Array.from(subjMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }))
      );

      // Quiz stats
      const completedQuizzes = quizzes.filter((q) => q.score !== null) as { score: number; total_questions: number }[];
      const avgScore = completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((s, q) => s + (q.score / q.total_questions) * 100, 0) / completedQuizzes.length)
        : 0;
      const bestScore = completedQuizzes.length > 0
        ? Math.max(...completedQuizzes.map((q) => (q.score / q.total_questions) * 100))
        : 0;
      setQuizStats({ total: quizzes.length, avgScore, bestScore: Math.round(bestScore) });

      // Note stats
      setNoteStats({ total: notes.length, summarized: notes.filter((n) => n.status === 'summarized').length });

      // Task stats
      setTaskStats({ total: tasks.length, completed: tasks.filter((t) => t.status === 'completed').length });

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen label="Crunching your numbers..." />;

  const totalWeekMinutes = weekData.reduce((s, d) => s + d.value, 0);
  const totalMonthMinutes = monthData.reduce((s, d) => s + d.value, 0);
  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Track your study habits, productivity, and progress over time."
        icon={<BarChart3 className="h-6 w-6" />}
      />

      {!hasData ? (
        <Card>
          <EmptyState
            icon={<BarChart3 className="h-7 w-7" />}
            title="No analytics data yet"
            description="Start studying — log study time, generate quizzes, and upload notes to see your analytics come to life."
          />
        </Card>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Clock} label="This Week" value={`${Math.floor(totalWeekMinutes / 60)}h ${totalWeekMinutes % 60}m`} accent="text-emerald-500" bg="bg-emerald-500/10" />
            <StatCard icon={TrendingUp} label="This Month" value={`${Math.floor(totalMonthMinutes / 60)}h ${totalMonthMinutes % 60}m`} accent="text-teal-500" bg="bg-teal-500/10" />
            <StatCard icon={Flame} label="Current Streak" value={`${profile?.study_streak || 0} days`} accent="text-orange-500" bg="bg-orange-500/10" />
            <StatCard icon={Target} label="Productivity" value={`${profile?.productivity_score || 0}%`} accent="text-blue-500" bg="bg-blue-500/10" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Weekly study time */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Daily Study Time</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 days</p>
                </div>
                <Badge variant="emerald">{totalWeekMinutes}m total</Badge>
              </div>
              <BarChart data={weekData} height={240} formatValue={(v) => `${v}m`} />
            </Card>

            {/* Subject distribution */}
            <Card>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Subject Distribution</h3>
              {subjectData.length > 0 ? (
                <DonutChart data={subjectData} centerValue={`${subjectData.length}`} centerLabel="subjects" />
              ) : (
                <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No data" description="Log study time by subject." />
              )}
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly trend */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Monthly Trend</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Study minutes per week</p>
                </div>
              </div>
              <LineChart data={monthData} height={220} />
            </Card>

            {/* Task completion */}
            <Card>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Task Completion</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-300">Completion rate</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{taskStats.total}</div>
                    <div className="text-xs text-slate-500">Total tasks</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{taskStats.completed}</div>
                    <div className="text-xs text-slate-500">Completed</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quiz & Notes stats */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quiz Performance</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{quizStats.total}</div>
                  <div className="text-xs text-slate-500 mt-1">Quizzes taken</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{quizStats.avgScore}%</div>
                  <div className="text-xs text-slate-500 mt-1">Avg score</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                  <div className="text-2xl font-bold text-amber-600">{quizStats.bestScore}%</div>
                  <div className="text-xs text-slate-500 mt-1">Best score</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notes Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{noteStats.total}</div>
                  <div className="text-xs text-slate-500 mt-1">Total notes</div>
                </div>
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-center">
                  <div className="text-2xl font-bold text-teal-600">{noteStats.summarized}</div>
                  <div className="text-xs text-slate-500 mt-1">AI summarized</div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
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
