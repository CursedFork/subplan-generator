import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChatPane } from '@/components/plan/ChatPane';
import { PlanPane } from '@/components/plan/PlanPane';
import { sendAgentMessage } from '@/lib/agentClient';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage, AgentState } from '@/types/app';

export default function NewPlan() {
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  const resumeSessionId = searchParams.get('session'); // existing session to resume
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [planState, setPlanState] = useState<AgentState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const initialized = useRef(false);

  // Auto-start: either resume an existing session or open a fresh one.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    void (async () => {
      setLoading(true);
      try {
        let greeting: string;
        let startSessionId: string | null;

        if (resumeSessionId) {
          // Resuming a draft — pass the existing session_id so the edge
          // function reloads all prior messages and state.
          startSessionId = resumeSessionId;
          greeting = "I'd like to continue working on this plan. Can you remind me where we left off and tell me what's still needed?";
        } else {
          startSessionId = null;
          greeting = templateParam
            ? `Hello, I need to create a sub plan using the "${templateParam}" template.`
            : 'Hello, I need to create a sub plan.';
        }

        const res = await sendAgentMessage(startSessionId, greeting);
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
      <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-rule">
        <div className="flex items-center gap-4">
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
          <span className="font-sans text-sm font-semibold text-ink">
            {resumeSessionId ? 'Continue draft' : 'New plan'}
          </span>
        </div>

        {/* Save & exit — draft is auto-saved after every turn so this just navigates away */}
        {!finalized && sessionId && (
          <button
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ['plans', user?.id] });
              void navigate('/plans');
            }}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-sans font-semibold text-ink-faint hover:text-ink border border-rule hover:border-ink-faint rounded px-3 py-1.5 transition-colors duration-150 disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save &amp; exit
          </button>
        )}
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
