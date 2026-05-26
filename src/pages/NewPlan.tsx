import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChatPane } from '@/components/plan/ChatPane';
import { PlanPane } from '@/components/plan/PlanPane';
import { sendAgentMessage } from '@/lib/agentClient';
import { useProfile } from '@/hooks/useProfile';
import type { ChatMessage, AgentState } from '@/types/app';

export default function NewPlan() {
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  const { data: profile } = useProfile();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [planState, setPlanState] = useState<AgentState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const initialized = useRef(false);

  // Auto-start: send an opening greeting so the agent opens the conversation.
  // If a template was chosen on the Templates page, include it in the message.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    void (async () => {
      setLoading(true);
      try {
        const greeting = templateParam
          ? `Hello, I need to create a sub plan using the "${templateParam}" template.`
          : 'Hello, I need to create a sub plan.';
        const res = await sendAgentMessage(null, greeting);
        setSessionId(res.session_id);
        setPlanState(res.state);
        setMessages([{ role: 'assistant', content: res.assistant_message }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[NewPlan] auto-start failed:', msg);
        setMessages([
          {
            role: 'assistant',
            content: `Connection error: ${msg}. Please refresh and try again.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const res = await sendAgentMessage(sessionId, trimmed);
      setSessionId(res.session_id);
      setPlanState(res.state);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.assistant_message }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[NewPlan] send failed:', msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const finalized = planState?.finalized ?? false;

  return (
    <div className="h-screen flex flex-col bg-paper">
      {/* Minimal header */}
      <header className="shrink-0 flex items-center gap-4 px-6 h-14 border-b border-rule">
        <Link
          to="/dashboard"
          className="text-ink-faint hover:text-ink transition-colors"
          aria-label="Back to dashboard"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="font-sans text-sm font-semibold text-ink">New plan</span>
      </header>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        <ChatPane
          messages={messages}
          loading={loading}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          disabled={finalized}
        />
        <PlanPane state={planState} teacherName={profile?.display_name ?? null} />
      </div>
    </div>
  );
}
