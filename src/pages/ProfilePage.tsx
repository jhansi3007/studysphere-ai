import { useState } from 'react';
import { User, Mail, GraduationCap, Flame, Clock, Target, Save } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, getInitials } from '@/lib/utils';

export function ProfilePage() {
  const { profile, user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [year, setYear] = useState(profile?.year || '');

  async function handleSave() {
    setSaving(true);
    await updateProfile({ full_name: fullName, bio, institution, major, year });
    setSaving(false);
    setEditing(false);
  }

  function cancelEdit() {
    setFullName(profile?.full_name || '');
    setBio(profile?.bio || '');
    setInstitution(profile?.institution || '');
    setMajor(profile?.major || '');
    setYear(profile?.year || '');
    setEditing(false);
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and study stats."
        icon={<User className="h-6 w-6" />}
        action={editing ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" /> Save</Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(true)}>Edit profile</Button>
        )}
      />

      {/* Profile header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-emerald-500/20">
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {profile?.full_name || 'Student'}
            </h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </span>
              {profile?.institution && (
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> {profile.institution}
                </span>
              )}
            </div>
            {profile?.bio && !editing && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{profile.bio}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="emerald">Member since {formatDate(profile?.created_at || new Date())}</Badge>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-2">
            <Flame className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.study_streak || 0}</div>
          <div className="text-xs text-slate-500">Day streak</div>
        </Card>
        <Card className="text-center p-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.floor((profile?.total_study_minutes || 0) / 60)}h</div>
          <div className="text-xs text-slate-500">Total study</div>
        </Card>
        <Card className="text-center p-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
            <Target className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.productivity_score || 0}%</div>
          <div className="text-xs text-slate-500">Productivity</div>
        </Card>
      </div>

      {/* Editable fields */}
      <Card>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Institution" placeholder="e.g. Stanford University" value={institution} onChange={(e) => setInstitution(e.target.value)} disabled={!editing} />
          <Input label="Major" placeholder="e.g. Computer Science" value={major} onChange={(e) => setMajor(e.target.value)} disabled={!editing} />
          <Input label="Year" placeholder="e.g. Sophomore" value={year} onChange={(e) => setYear(e.target.value)} disabled={!editing} />
        </div>
        <div className="mt-4">
          <Textarea label="Bio" rows={3} placeholder="Tell us about your academic goals..." value={bio} onChange={(e) => setBio(e.target.value)} disabled={!editing} />
        </div>
      </Card>
    </div>
  );
}
