import React from 'react';
import MessageCard, { Message, DecryptedMessage } from './MessageCard';

export type { Message, DecryptedMessage };

interface MessageListProps {
  messages: Message[];
  decryptedMessages: Map<number, DecryptedMessage>;
  isLoading: boolean;
  isDecrypting: number | null;
  canDecrypt: boolean;
  onDecrypt: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  decryptedMessages,
  isLoading,
  isDecrypting,
  canDecrypt,
  onDecrypt,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No messages for this case</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          decrypted={decryptedMessages.get(message.id) || null}
          isDecrypting={isDecrypting === message.id}
          canDecrypt={canDecrypt}
          onDecrypt={() => onDecrypt(message)}
        />
      ))}
    </div>
  );
};

export default MessageList;

