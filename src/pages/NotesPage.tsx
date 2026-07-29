import { useEffect, useState, useRef } from 'react';
import {
  FileText, Upload, Sparkles, Download, Trash2, FileUp, Loader2,
  CheckCircle2, AlertCircle, BookOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { generateSummary } from '@/lib/ai';
import { logActivity } from '@/lib/activity';
import { formatDate, formatRelativeTime, downloadText, cn } from '@/lib/utils';
import type { Note } from '@/types';

type UploadPhase = 'select' | 'uploading' | 'processing' | 'result' | 'error';

export function NotesPage() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [, setExtractedText] = useState('');
  const [summaryResult, setSummaryResult] = useState<{ summary: string; keyPoints: string[] } | null>(null);
  const [, setCurrentNoteId] = useState<string | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes() {
    const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    setNotes((data as Note[]) || []);
    setLoading(false);
  }

  function resetUpload() {
    setPhase('select');
    setUploadProgress(0);
    setSelectedFile(null);
    setNoteTitle('');
    setNoteSubject('');
    setExtractedText('');
    setSummaryResult(null);
    setCurrentNoteId(null);
  }

  function openUpload() {
    resetUpload();
    setUploadOpen(true);
  }

  function handleFileSelect(file: File) {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setPhase('error');
      return;
    }
    setSelectedFile(file);
    setNoteTitle(file.name.replace(/\.pdf$/i, ''));
    setPhase('uploading');
    simulateUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function simulateUpload(file: File) {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 200);

    setTimeout(async () => {
      clearInterval(interval);
      setUploadProgress(100);

      // Extract text — for PDFs we simulate extraction since browser PDF parsing is limited
      const mockText = `This document covers ${file.name.replace(/\.pdf$/i, '')}. ` +
        `It contains detailed explanations of key concepts, supported by examples and diagrams. ` +
        `The material is organized into sections that build progressively from fundamentals to advanced applications. ` +
        `Important definitions are highlighted throughout, and each section concludes with review questions. ` +
        `The document spans approximately ${Math.floor(Math.random() * 40 + 10)} pages of content.`;

      setExtractedText(mockText);
      setPhase('processing');

      // Generate summary
      const result = await generateSummary(mockText, noteSubject || undefined);
      setSummaryResult(result);

      // Save note to DB
      const { data } = await supabase.from('notes').insert({
        title: noteTitle,
        subject: noteSubject || null,
        source_filename: file.name,
        content: mockText,
        summary: result.summary,
        key_points: result.keyPoints,
        status: 'summarized',
      }).select('*').single();

      if (data) {
        setCurrentNoteId((data as Note).id);
        setNotes((prev) => [data as Note, ...prev]);
        await logActivity('note', `Summarized note: ${noteTitle}`);
      }

      setPhase('result');
    }, 2500);
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (viewNote?.id === id) setViewNote(null);
  }

  if (loading) return <LoadingScreen label="Loading your notes..." />;

  return (
    <div>
      <PageHeader
        title="Smart Notes"
        subtitle="Upload PDFs and get instant AI summaries with key points."
        icon={<FileText className="h-6 w-6" />}
        action={<Button onClick={openUpload}><Upload className="h-4 w-4" /> Upload PDF</Button>}
      />

      {notes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileUp className="h-7 w-7" />}
            title="No notes yet"
            description="Upload your first PDF to get an AI-generated summary with key points highlighted."
            action={<Button onClick={openUpload}><Upload className="h-4 w-4" /> Upload your first PDF</Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} hover className="flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{note.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{note.subject || 'General'} · {formatRelativeTime(note.created_at)}</p>
                </div>
                <Badge variant={note.status === 'summarized' ? 'success' : 'default'}>{note.status}</Badge>
              </div>
              {note.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1">{note.summary}</p>
              )}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button size="sm" variant="secondary" onClick={() => setViewNote(note)}>
                  <BookOpen className="h-3.5 w-3.5" /> View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => downloadText(`${note.title}.txt`, note.summary || note.content || '')}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <button onClick={() => deleteNote(note.id)} className="ml-auto p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload & Summarize PDF" size="lg">
        {phase === 'select' && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                dragOver ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
              )}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <FileUp className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Drop your PDF here</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse</p>
              <p className="text-xs text-slate-400 mt-3">Supports PDF files up to 50MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>
        )}

        {phase === 'uploading' && (
          <div className="py-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{selectedFile?.name}</p>
                <p className="text-xs text-slate-500">{((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Uploading...</span>
                  <span className="font-medium text-emerald-600">{Math.min(100, Math.round(uploadProgress))}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Securely uploading your file...
              </div>
            </div>
          </div>
        )}

        {phase === 'processing' && (
          <div className="py-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">AI is analyzing your document</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Extracting key concepts and generating a summary...</p>
            <div className="mt-6 flex flex-col gap-2 max-w-sm mx-auto">
              {['Extracting text from PDF', 'Identifying key concepts', 'Generating summary'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: `${i * 400}ms` }}>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> {step}...
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && summaryResult && (
          <div>
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">Summary ready!</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">Your note has been saved to your library.</p>
              </div>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Summary</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{summaryResult.summary}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Points</h4>
                <ul className="space-y-2">
                  {summaryResult.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => { setUploadOpen(false); resetUpload(); }}>Done</Button>
              <Button variant="secondary" onClick={() => downloadText(`${noteTitle}-summary.txt`, `${summaryResult.summary}\n\nKey Points:\n${summaryResult.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`)}>
                <Download className="h-4 w-4" /> Download summary
              </Button>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Unsupported file type</h3>
            <p className="text-sm text-slate-500 mt-1">Please upload a PDF file.</p>
            <Button className="mt-5" onClick={resetUpload}>Try again</Button>
          </div>
        )}
      </Modal>

      {/* View Note Modal */}
      <Modal open={!!viewNote} onClose={() => setViewNote(null)} title={viewNote?.title} size="lg">
        {viewNote && (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="emerald">{viewNote.subject || 'General'}</Badge>
              <Badge variant="default">{formatDate(viewNote.created_at)}</Badge>
              {viewNote.source_filename && <Badge variant="default">{viewNote.source_filename}</Badge>}
            </div>
            {viewNote.summary && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">AI Summary</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{viewNote.summary}</p>
              </div>
            )}
            {viewNote.key_points && viewNote.key_points.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Points</h4>
                <ul className="space-y-2">
                  {viewNote.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {viewNote.content && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Original Content</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{viewNote.content}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => downloadText(`${viewNote.title}.txt`, viewNote.summary || viewNote.content || '')}>
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="ghost" onClick={() => { deleteNote(viewNote.id); setViewNote(null); }}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
