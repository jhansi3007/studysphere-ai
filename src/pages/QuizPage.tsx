import { useEffect, useState } from 'react';
import {
  ListChecks, Sparkles, Play, CheckCircle2, XCircle, RotateCcw,
  Trophy, ChevronRight, Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { generateQuiz, type QuizQuestionResult } from '@/lib/ai';
import { logActivity } from '@/lib/activity';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Quiz } from '@/types';

type View = 'list' | 'generate' | 'taking' | 'result';

export function QuizPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Generate form
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Quiz taking
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionResult[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { loadQuizzes(); }, []);

  async function loadQuizzes() {
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    setQuizzes((data as Quiz[]) || []);
    setLoading(false);
  }

  async function handleGenerate() {
    if (!topic.trim()) { setGenError('Please enter a topic'); return; }
    setGenError('');
    setGenerating(true);
    const generated = await generateQuiz(topic.trim(), numQuestions, difficulty);
    setGenerating(false);

    const newQuiz: Partial<Quiz> = {
      title: `${topic.trim()} Quiz`,
      subject: topic.trim(),
      questions: generated,
      difficulty,
      total_questions: generated.length,
      status: 'generated',
    };
    const { data } = await supabase.from('quizzes').insert(newQuiz).select('*').single();
    if (data) {
      const saved = data as Quiz;
      setQuizzes((prev) => [saved, ...prev]);
      await logActivity('quiz', `Generated quiz: ${saved.title}`);
      startQuiz(saved, generated);
    }
  }

  function startQuiz(quiz: Quiz, qs?: QuizQuestionResult[]) {
    setActiveQuiz(quiz);
    setQuestions(qs || (quiz.questions as unknown as QuizQuestionResult[]));
    setCurrentIdx(0);
    setAnswers({});
    setShowFeedback(false);
    setScore(0);
    setView('taking');
  }

  function selectAnswer(qId: string, idx: number) {
    if (showFeedback) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
    setShowFeedback(true);
    const q = questions[currentIdx];
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }

  function nextQuestion() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    if (!activeQuiz) return;
    const finalScore = Object.entries(answers).filter(([qId, ans]: [string, number]) => {
      const q = questions.find((q) => q.id === qId);
      return q && q.correctIndex === ans;
    }).length;
    setScore(finalScore);
    await supabase.from('quizzes').update({ score: finalScore, status: 'completed' }).eq('id', activeQuiz.id);
    setQuizzes((prev) => prev.map((q) => q.id === activeQuiz.id ? { ...q, score: finalScore, status: 'completed' } : q));
    await logActivity('quiz', `Completed quiz: ${activeQuiz.title} (${finalScore}/${questions.length})`);
    setView('result');
  }

  async function deleteQuiz(id: string) {
    await supabase.from('quizzes').delete().eq('id', id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }

  if (loading) return <LoadingScreen label="Loading quizzes..." />;

  // Generate view
  if (view === 'generate') {
    return (
      <div>
        <PageHeader
          title="Generate Quiz"
          subtitle="Create a custom quiz on any topic with AI."
          icon={<Sparkles className="h-6 w-6" />}
          action={<Button variant="ghost" onClick={() => setView('list')}>Back to quizzes</Button>}
        />
        <Card className="max-w-2xl mx-auto">
          <div className="space-y-5">
            <Input
              label="Topic or subject"
              placeholder="e.g. Cell Biology, World War II, Linear Algebra"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              error={genError}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Number of questions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
              </Select>
              <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
                AI will generate {numQuestions} multiple-choice questions with explanations
              </div>
            </div>
            <Button onClick={handleGenerate} loading={generating} className="w-full" size="lg">
              {generating ? 'Generating quiz...' : 'Generate Quiz'}
            </Button>
            {generating && (
              <div className="flex flex-col gap-2 mt-4">
                {['Analyzing topic', 'Creating questions', 'Writing explanations'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: `${i * 500}ms` }}>
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /> {s}...
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Taking view
  if (view === 'taking' && activeQuiz && questions.length > 0) {
    const q = questions[currentIdx];
    const selected = answers[q.id];
    const progress = ((currentIdx + (showFeedback ? 1 : 0)) / questions.length) * 100;

    return (
      <div>
        <PageHeader
          title={activeQuiz.title}
          subtitle={`Question ${currentIdx + 1} of ${questions.length}`}
          icon={<ListChecks className="h-6 w-6" />}
        />
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{currentIdx + 1}/{questions.length}</span>
            </div>
            <Progress value={progress} />
          </div>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="emerald">{activeQuiz.difficulty}</Badge>
              <Badge variant="default">{activeQuiz.subject}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">{q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === q.correctIndex;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(q.id, i)}
                    disabled={showFeedback}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3',
                      !showFeedback && 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10',
                      showCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
                      showWrong && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                      !showCorrect && !showWrong && 'border-slate-200 dark:border-slate-800',
                      showFeedback && !isCorrect && !isSelected && 'opacity-50'
                    )}
                  >
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 border-2',
                      showCorrect ? 'border-emerald-500 bg-emerald-500 text-white' :
                      showWrong ? 'border-red-500 bg-red-500 text-white' :
                      'border-slate-300 dark:border-slate-600 text-slate-500'
                    )}>
                      {showCorrect ? <CheckCircle2 className="h-4 w-4" /> : showWrong ? <XCircle className="h-4 w-4" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className="mt-5 animate-fade-in">
                <div className={cn(
                  'p-4 rounded-xl',
                  selected === q.correctIndex ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                )}>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                    {selected === q.correctIndex ? 'Correct!' : 'Not quite right.'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{q.explanation}</p>
                </div>
                <Button onClick={nextQuestion} className="w-full mt-4">
                  {currentIdx < questions.length - 1 ? 'Next question' : 'See results'} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Result view
  if (view === 'result' && activeQuiz) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <div>
        <PageHeader title="Quiz Results" subtitle={activeQuiz.title} icon={<Trophy className="h-6 w-6" />} />
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-10">
            <div className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-5',
              passed ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            )}>
              <Trophy className={cn('h-12 w-12', passed ? 'text-emerald-500' : 'text-amber-500')} />
            </div>
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">{score} / {questions.length}</h2>
            <p className={cn('text-lg font-semibold mt-2', passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
              {pct}% — {passed ? 'Great job!' : 'Keep practicing!'}
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{questions.filter((q) => answers[q.id] === q.correctIndex).length}</div>
                <div className="text-xs text-slate-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{questions.length - score}</div>
                <div className="text-xs text-slate-500">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{pct}%</div>
                <div className="text-xs text-slate-500">Score</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center mt-8">
              <Button onClick={() => startQuiz(activeQuiz)} variant="secondary">
                <RotateCcw className="h-4 w-4" /> Retake quiz
              </Button>
              <Button onClick={() => setView('list')}>Back to quizzes</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // List view (default)
  return (
    <div>
      <PageHeader
        title="Quiz Generator"
        subtitle="Create and take AI-powered quizzes on any topic."
        icon={<ListChecks className="h-6 w-6" />}
        action={<Button onClick={() => setView('generate')}><Sparkles className="h-4 w-4" /> New Quiz</Button>}
      />

      {quizzes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListChecks className="h-7 w-7" />}
            title="No quizzes yet"
            description="Generate your first quiz on any topic — the AI creates questions, options, and explanations instantly."
            action={<Button onClick={() => setView('generate')}><Sparkles className="h-4 w-4" /> Generate a quiz</Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hover className="flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{quiz.total_questions} questions · {formatRelativeTime(quiz.created_at)}</p>
                </div>
                <button onClick={() => deleteQuiz(quiz.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="emerald">{quiz.difficulty}</Badge>
                {quiz.score !== null ? (
                  <Badge variant={quiz.score / quiz.total_questions >= 0.7 ? 'success' : 'warning'}>
                    Scored {quiz.score}/{quiz.total_questions}
                  </Badge>
                ) : (
                  <Badge variant="default">Not taken</Badge>
                )}
              </div>
              <Button size="sm" className="mt-auto" onClick={() => startQuiz(quiz)}>
                <Play className="h-3.5 w-3.5" /> {quiz.score !== null ? 'Retake' : 'Start quiz'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
