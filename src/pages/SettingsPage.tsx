import { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Palette, Target, Moon, Sun,
  Monitor, Check, Shield, LogOut,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const prefs = profile?.preferences || { theme: 'system', notifications: true, weeklyGoal: 300, emailUpdates: true };
  const [notifications, setNotifications] = useState(prefs.notifications ?? true);
  const [emailUpdates, setEmailUpdates] = useState(prefs.emailUpdates ?? true);
  const [weeklyGoal, setWeeklyGoal] = useState(prefs.weeklyGoal ?? 300);

  async function handleSavePrefs() {
    setSaving(true);
    await updateProfile({
      preferences: { ...prefs, notifications, emailUpdates, weeklyGoal },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Customize your StudySphere experience."
        icon={<SettingsIcon className="h-6 w-6" />}
      />

      <div className="space-y-6 max-w-3xl">
        {/* Appearance */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Appearance</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred theme</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(prefersDark ? 'dark' : 'light');
                  } else {
                    setTheme(opt.value);
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  theme === opt.value
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <opt.icon className={cn('h-6 w-6', theme === opt.value ? 'text-emerald-500' : 'text-slate-400')} />
                <span className={cn('text-sm font-medium', theme === opt.value ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400')}>
                  {opt.label}
                </span>
                {theme === opt.value && <Check className="h-4 w-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your notification preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleRow
              label="Push notifications"
              description="Get reminders for upcoming study sessions and exams"
              checked={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              label="Email updates"
              description="Weekly progress reports and study tips"
              checked={emailUpdates}
              onChange={setEmailUpdates}
            />
          </div>
        </Card>

        {/* Study goals */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Study Goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Set your weekly study target</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-300">Weekly goal</span>
                <span className="font-semibold text-emerald-600">{weeklyGoal} minutes</span>
              </div>
              <input
                type="range"
                min={60}
                max={1000}
                step={30}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1h</span>
                <span>16h+</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSavePrefs} loading={saving}>
            {saved ? <><Check className="h-4 w-4" /> Saved!</> : 'Save preferences'}
          </Button>
          {saved && <span className="text-sm text-emerald-600 flex items-center gap-1 animate-fade-in"><Check className="h-4 w-4" /> Settings updated</span>}
        </div>

        {/* Account */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Account</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and session</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={signOut} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors shrink-0',
          checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-5'
        )} />
      </button>
    </div>
  );
}
