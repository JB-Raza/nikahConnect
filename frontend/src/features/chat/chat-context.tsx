import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { chats as initialChats, type ChatItem } from './data';

type ChatContextValue = {
  chats: ChatItem[];
  markChatRead: (id: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ChatItem[]>(initialChats);

  const markChatRead = useCallback((id: string) => {
    setItems((current) =>
      current.map((chat) => (chat.id === id ? { ...chat, unreadCount: 0 } : chat)),
    );
  }, []);

  const value = useMemo(() => ({ chats: items, markChatRead }), [items, markChatRead]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatProvider');
  }
  return context;
}
