import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ChatMessage } from '@/types/app';

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatPane({ messages, loading, input, onInputChange, onSend, disabled }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col w-1/2 border-r border-rule">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-sans text-ink-faint">Starting your session…</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-md px-4 py-3 text-sm font-sans leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-terracotta text-paper'
                  : 'bg-paper border border-rule text-ink shadow-card'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-paper border border-rule rounded-md px-4 py-3 shadow-card">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-rule px-6 py-4 flex gap-3">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Plan complete.' : 'Type your message…'}
          disabled={disabled ?? loading}
          className="flex-1"
        />
        <Button
          onClick={onSend}
          disabled={disabled ?? (loading || !input.trim())}
          className="shrink-0"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
