'use client';

import { api } from '@/lib/axios';
import { HtmlHTMLAttributes, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';

interface otherUser {
  id: string;
  username: string;
  fullName: string;
  profilePic: string;
  email: string;
}

interface Chat {
  id: string;
  createdAt: string;
  isGroup: boolean;
  updatedAt: string;
  name: string;
  otherUser: otherUser;
  members: otherUser[];
  lastMessage: {
    content: string;
    createdAt: string;
    id: string;
    senderId: string;
    sender: {
      id: string;
      username: string;
    };
  };
}

interface Message {
  id: string;
  chatId: string;
  createdAt: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    profilePic: string;
  };
}

interface Props {
  selectedChat: Chat;
  msgs: Message[];
  getFormattedTime: (createdAt?: string) => string;
  setMsgs: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatWindow({ selectedChat, msgs, getFormattedTime, setMsgs }: Props) {
  const [msg, setMsg] = useState<string>('');
  const { user, loading } = useAuth();
  // console.log('selectedChat', selectedChat);

  if (!user?.id) return;

  useEffect(() => {
    const container = document.getElementById('chat-container');
    container?.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [msgs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const handleSendMsg = async () => {
    if (!msg.trim() || !selectedChat) return;

    const tempMsg = {
      id: Date.now().toString(),
      chatId: selectedChat.id,
      content: msg,
      createdAt: new Date().toISOString(),
      senderId: user?.id,
      sender: {
        id: user?.id,
        username: user?.username || 'You',
        profilePic: '',
      },
    };

    setMsgs((prev) => [...prev, tempMsg]);
    setMsg('');

    try {
      await api.post('/message', {
        chatId: selectedChat.id,
        content: msg,
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
          {!selectedChat.isGroup
            ? selectedChat.otherUser.username[0].toUpperCase()
            : selectedChat.name[0].toUpperCase()}
        </div>

        <p className="font-semibold">
          {!selectedChat.isGroup ? selectedChat.otherUser.username : selectedChat.name}
        </p>
      </div>

      {/* Messages */}
      <div id="chat-container" className="flex-1 p-4 overflow-y-auto space-y-3">
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === selectedChat.otherUser?.id ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`${
                msg.senderId === selectedChat.otherUser?.id ? 'bg-gray-300' : 'bg-green-300'
              } px-3 py-2 rounded-lg max-w-xs`}
            >
              <p className="text-sm text-black">{msg.content}</p>
              <span className="text-[10px] text-gray-500">{getFormattedTime(msg.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={msg}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded text-black"
        />
        <button
          className="bg-black text-white px-4 rounded hover:bg-gray-900 cursor-pointer"
          onClick={handleSendMsg}
        >
          Send
        </button>
      </div>
    </div>
  );
}
