import { useEffect, useState, useMemo } from 'react';
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, CheckCircle2,
  Circle, Trash2, AlertCircle, ListTodo,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/activity';
import { cn, formatDate } from '@/lib/utils';
import type { PlannerTask } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const priorityColors: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',
};
const priorityBadge: Record<string, 'error' | 'warning' | 'success'> = {
  high: 'error', medium: 'warning', low: 'success',
};

export function PlannerPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const { data } = await supabase.from('planner_tasks').select('*').order('scheduled_date', { ascending: true });
    setTasks((data as PlannerTask[]) || []);
    setLoading(false);
  }

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, PlannerTask[]>();
    tasks.forEach((t) => {
      const key = t.scheduled_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().slice(0, 10);
    return tasksByDate.get(key) || [];
  }, [selectedDate, tasksByDate]);

  function dateKey(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  function isToday(d: Date) {
    return dateKey(d) === dateKey(new Date());
  }

  function openAddTask(date?: Date) {
    const target = date || selectedDate || new Date();
    setSelectedDate(target);
    setFormDate(dateKey(target));
    setFormTitle('');
    setFormSubject('');
    setFormTime('');
    setFormDuration(60);
    setFormPriority('medium');
    setFormDesc('');
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formTitle.trim()) { setFormError('Title is required'); return; }
    if (!formDate) { setFormError('Date is required'); return; }
    setFormError('');
    setSaving(true);

    const { data } = await supabase.from('planner_tasks').insert({
      title: formTitle.trim(),
      subject: formSubject.trim() || null,
      description: formDesc.trim() || null,
      scheduled_date: formDate,
      start_time: formTime || null,
      duration_minutes: formDuration,
      priority: formPriority,
      status: 'planned',
    }).select('*').single();

    setSaving(false);
    if (data) {
      setTasks((prev) => [...prev, data as PlannerTask].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
      await logActivity('planner', `Scheduled: ${formTitle}`);
      setModalOpen(false);
    }
  }

  async function toggleStatus(task: PlannerTask) {
    const newStatus = task.status === 'completed' ? 'planned' : 'completed';
    await supabase.from('planner_tasks').update({ status: newStatus }).eq('id', task.id);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
  }

  async function deleteTask(id: string) {
    await supabase.from('planner_tasks').delete().eq('id', id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const upcomingTasks = useMemo(() => {
    const today = dateKey(new Date());
    return tasks.filter((t) => t.scheduled_date >= today && t.status !== 'completed').slice(0, 5);
  }, [tasks]);

  if (loading) return <LoadingScreen label="Loading your planner..." />;

  return (
    <div>
      <PageHeader
        title="Study Planner"
        subtitle="Plan your study sessions and track deadlines on a calendar."
        icon={<CalendarDays className="h-6 w-6" />}
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500')}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500')}
              >
                List
              </button>
            </div>
            <Button onClick={() => openAddTask()}><Plus className="h-4 w-4" /> Add task</Button>
          </div>
        }
      />

      {viewMode === 'calendar' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentDate(new Date())} className="btn-ghost text-xs">Today</button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronLeft className="h-5 w-5 text-slate-500" />
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarData.map((d, i) => {
                if (!d) return <div key={i} />;
                const key = dateKey(d);
                const dayTasks = tasksByDate.get(key) || [];
                const isSelected = selectedDate && dateKey(selectedDate) === key;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      'aspect-square rounded-xl p-1.5 flex flex-col items-center gap-1 border transition-all relative',
                      isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      isToday(d) && 'ring-1 ring-emerald-500'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isToday(d) ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    )}>{d.getDate()}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {dayTasks.slice(0, 3).map((t) => (
                          <span key={t.id} className={cn('w-1.5 h-1.5 rounded-full',
                            t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          )} />
                        ))}
                        {dayTasks.length > 3 && <span className="text-[8px] text-slate-400">+{dayTasks.length - 3}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected day / upcoming */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedDate ? formatDate(selectedDate) : 'Upcoming Tasks'}
                </h3>
                {selectedDate && (
                  <Button size="sm" variant="ghost" onClick={() => openAddTask(selectedDate)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {selectedDate ? (
                selectedDateTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => (
                      <TaskItem key={task.id} task={task} onToggle={toggleStatus} onDelete={deleteTask} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No tasks" description="Add a study session for this day." action={<Button size="sm" onClick={() => openAddTask(selectedDate)}><Plus className="h-3.5 w-3.5" /> Add task</Button>} />
                )
              ) : (
                upcomingTasks.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingTasks.map((task) => (
                      <TaskItem key={task.id} task={task} onToggle={toggleStatus} onDelete={deleteTask} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<ListTodo className="h-6 w-6" />} title="No upcoming tasks" description="Add your first study task to get started." />
                )
              )}
            </Card>
          </div>
        </div>
      ) : (
        // List view
        <Card>
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleStatus} onDelete={deleteTask} showDate />
              ))}
            </div>
          ) : (
            <EmptyState icon={<ListTodo className="h-7 w-7" />} title="No tasks yet" description="Add your first study task to start planning." action={<Button onClick={() => openAddTask()}><Plus className="h-4 w-4" /> Add task</Button>} />
          )}
        </Card>
      )}

      {/* Add Task Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Study Task">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {formError}
            </div>
          )}
          <Input label="Task title" placeholder="e.g. Review Chapter 5" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Subject" placeholder="e.g. Biology" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
            <Input label="Date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Start time" type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
            <Select label="Duration" value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))}>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </Select>
            <Select label="Priority" value={formPriority} onChange={(e) => setFormPriority(e.target.value as 'low' | 'medium' | 'high')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <Textarea label="Description (optional)" rows={2} placeholder="Notes about this study session..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">Add task</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, showDate }: {
  task: PlannerTask;
  onToggle: (t: PlannerTask) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
}) {
  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-4', priorityColors[task.priority], task.status === 'completed' && 'opacity-60')}>
      <button onClick={() => onToggle(task)} className="mt-0.5 shrink-0">
        {task.status === 'completed'
          ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          : <Circle className="h-5 w-5 text-slate-400 hover:text-emerald-500 transition-colors" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium text-slate-800 dark:text-slate-200', task.status === 'completed' && 'line-through')}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.subject && <span className="text-xs text-slate-500">{task.subject}</span>}
          {showDate && <span className="text-xs text-slate-400">{formatDate(task.scheduled_date)}</span>}
          {task.start_time && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {task.start_time.slice(0, 5)}
            </span>
          )}
          <Badge variant={priorityBadge[task.priority]}>{task.priority}</Badge>
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
