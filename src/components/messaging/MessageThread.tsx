import React from 'react';

export type SenderRole = 'whistleblower' | 'investigator';

export interface ThreadMessage {
  id: string;
  sender: SenderRole;
  body: string;
  sentAt: string; // ISO string or human-readable timestamp (mocked)
}

interface MessageThreadProps {
  messages: ThreadMessage[];
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages }) => {
  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isWhistleblower = message.sender === 'whistleblower';
        return (
          <div key={message.id} className="flex">
            <div className={isWhistleblower ? 'ml-auto max-w-[70%]' : 'mr-auto max-w-[70%]'}>
              <div
                className={`rounded-2xl px-4 py-2 text-sm shadow-sm transition ${
                  isWhistleblower
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-slate-900 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
              </div>
              <div
                className={`mt-1 text-[11px] ${
                  isWhistleblower ? 'text-primary-100 text-right' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isWhistleblower ? 'Whistleblower' : 'Investigator'} · {message.sentAt}
              </div>
            </div>
          </div>
        );
      })}
      {messages.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">No messages yet. Use the box below to reply.</p>
      )}
    </div>
  );
};

export default MessageThread;


