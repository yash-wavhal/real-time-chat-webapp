'use client';

import ChatWindow from '@/components/ChatWindow';
import { useAuth } from '@/components/context/AuthContext';
import { useSocket } from '@/components/context/SocketContext';
import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';
import LeftSide from '@/components/LeftSide';
import { Chat } from '@/types/chat';
import { Message } from '@/types/message';

export default function Page() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [whoTyping, setWhoTyping] = useState<string>("");

  useEffect(() => {
    socket?.emit("joinChat", selectedChat?.id)
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;
    socket.on('typing', ({ chatId, userId }) => {
      if (chatId === selectedChat?.id && userId !== user?.id) {
        setIsTyping(true);
        setWhoTyping(userId);
      }
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      if (chatId === selectedChat?.id && userId !== user?.id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [selectedChat]);

  useEffect(() => {
      if (!socket) return;

    const handleOnline = (userId: string) => {
        // console.log('online user: ', userId);
        setOnlineUsers((prev) => {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        });
      };

      const handleOffline = (userId: string) => {
        setOnlineUsers((prev) => prev.filter((p) => p !== userId));
      };

      const handleInitialUsers = (users: string[]) => {
        // console.log('Initial users:', users);
        setOnlineUsers(users);
      };

      socket.on('getOnlineUsers', handleInitialUsers);
      socket.on('userOnline', handleOnline);
      socket.on('userOffline', handleOffline);

      return () => {
        socket.off('getOnlineUsers', handleInitialUsers);
        socket.off('userOnline', handleOnline);
        socket.off('userOffline', handleOffline);
      };
    }, [socket, user?.id]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get(`/chat`);
        // console.log('chats: ', res.data.formattedChats);
        setChats(res.data.formattedChats);
      } catch (err) {
        console.log('Error fetching chats');
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const { message, chat } = data;

      if (!chat || !chat.id) return;

      // ignore sender
      if (message.senderId === user?.id) return;

      // Update messages if open
      if (message.chatId === selectedChat?.id) {
        setMsgs((prev) => {
          const exists = prev.some((msg) => msg.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }

      // Update chat list
      setChats((prev) => {
        const safePrev = prev.filter(Boolean);

        const exists = safePrev.find((c) => c.id === chat.id);

        if (exists) {
          const updated = safePrev.map((c) => {
            if (c.id === chat.id) {
              return {
                ...c,
                lastMessage: chat.lastMessage,
                updatedAt: chat.updatedAt,
              };
            }
            return c;
          });

          const current = updated.find((c) => c.id === chat.id);
          const rest = updated.filter((c) => c.id !== chat.id);

          if (!current) return updated;

          return [current, ...rest];
        }

        return [chat, ...safePrev];
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedChat?.id, user?.id]);

  const handleChatClick = async (chat: Chat, isNewChat?: boolean) => {
    try {
      setSelectedChat(chat);
      // console.log('chat.otherUser.id', chat.otherUser.id);
      if (isNewChat) {
        setMsgs([]);
        return;
      }

      const messages = await api.get(`/message/${chat.id}`);
      console.log('messages:', messages.data);
      setMsgs(messages.data.messages);
    } catch (err: any) {
      console.log('Error in Fetching msgs for chat c', err.message);
    }
  };

  const getFormattedTime = (createdAt?: string) => {
    if (!createdAt) return '';

    const date = new Date(createdAt);
    const now = new Date();

    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-[30%] bg-mist-950 text-white border-r border-gray-800">
        <LeftSide
          chats={chats}
          handleChatClick={handleChatClick}
          getFormattedTime={getFormattedTime}
          onlineUsers={onlineUsers}
          isTyping={isTyping}
          selectedChat={selectedChat}
          whoTyping={whoTyping}
        />
      </div>

      {/* RIGHT SIDE (CHAT WINDOW) */}
      <div className="w-[70%] bg-mist-900 flex items-center justify-center">
        {selectedChat ? (
          <ChatWindow
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            msgs={msgs}
            getFormattedTime={getFormattedTime}
            setMsgs={setMsgs}
            setChats={setChats}
            isTyping={isTyping}
            onlineUsers={onlineUsers}
          />
        ) : (
          <p className="text-gray-500 flex items-center justify-center h-full">
            Select a chat to start messaging
          </p>
        )}
      </div>
    </div>
  );
}
