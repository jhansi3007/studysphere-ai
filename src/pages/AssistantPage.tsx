import { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Send, Copy, Check, Trash2, Plus, MessageSquare, User, Bot, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { generateChatResponse, SUGGESTED_PROMPTS } from '@/lib/ai';
import { logActivity } from '@/lib/activity';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { ChatConversation, ChatMessage } from '@/types';

export function AssistantPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  async function loadConversations() {
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    const list = (data as ChatConversation[]) || [];
    setConversations(list);
    if (list.length > 0) setActiveId(list[0].id);
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  }

  async function newConversation(): Promise<string> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ title: 'New conversation' })
      .select('*')
      .single();
    if (error || !data) return activeId || '';
    const conv = data as ChatConversation;
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setMessages([]);
    return conv.id;
  }

  async function deleteConversation(id: string) {
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining[0]?.id || null);
      setMessages(remaining[0] ? [] : []);
    }
  }

  async function clearChat() {
    if (!activeId) return;
    await supabase.from('chat_messages').delete().eq('conversation_id', activeId);
    setMessages([]);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    let convId = activeId;
    if (!convId) convId = await newConversation();

    // Insert user message
    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: convId, role: 'user', content: trimmed })
      .select('*')
      .single();

    if (userMsg) setMessages((prev) => [...prev, userMsg as ChatMessage]);

    // Update conversation title if it's the first message
    if (conversations.find((c) => c.id === convId)?.title === 'New conversation') {
      const title = trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : '');
      await supabase.from('chat_conversations').update({ title }).eq('id', convId);
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title } : c)));
    }

    setInput('');
    setThinking(true);

    const response = await generateChatResponse(trimmed);

    const { data: aiMsg } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: convId, role: 'assistant', content: response })
      .select('*')
      .single();

    setThinking(false);
    if (aiMsg) setMessages((prev) => [...prev, aiMsg as ChatMessage]);

    await logActivity('study', 'Used AI Assistant');
  }

  function handleSuggestion(prompt: string) {
    sendMessage(prompt);
  }

  function copyMessage(msg: ChatMessage) {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return <LoadingScreen label="Loading conversations..." />;

  return (
    <div>
      <PageHeader
        title="AI Study Assistant"
        subtitle="Ask anything — get explanations, study tips, and practice problems."
        icon={<Sparkles className="h-6 w-6" />}
        action={
          <Button onClick={newConversation} variant="secondary">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        }
      />

      <div className="flex gap-6" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        {/* Conversation history sidebar */}
        <div className={cn('shrink-0 transition-all', sidebarOpen ? 'w-64' : 'w-0')}>
          {sidebarOpen && (
            <Card className="h-full flex flex-col !p-3 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">History</span>
                <button onClick={() => setSidebarOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
                  Hide
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        'group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors',
                        activeId === conv.id ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      )}
                      onClick={() => setActiveId(conv.id)}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(conv.updated_at)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">No conversations yet</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost h-fit">
            <MessageSquare className="h-4 w-4" /> History
          </button>
        )}

        {/* Chat area */}
        <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 && !thinking ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">How can I help you study?</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try one of these prompts to get started:</p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl w-full">
                  {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(prompt)}
                      className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-sm text-slate-700 dark:text-slate-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex gap-3 animate-fade-in', msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'gradient-bg text-white'
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn('group max-w-[80%]', msg.role === 'user' && 'flex flex-col items-end')}>
                      <div className={cn(
                        'rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      )}>
                        {msg.content}
                      </div>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => copyMessage(msg)} className="text-xs text-slate-400 hover:text-emerald-500 flex items-center gap-1">
                            {copiedId === msg.id ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </button>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatRelativeTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-9 h-9 rounded-xl gradient-bg text-white flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            {messages.length > 0 && (
              <div className="flex justify-end mb-2">
                <button onClick={clearChat} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Clear chat
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI tutor anything..."
                className="input flex-1"
                disabled={thinking}
              />
              <Button type="submit" loading={thinking} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
