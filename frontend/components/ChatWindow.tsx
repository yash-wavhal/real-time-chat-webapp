'use client';

import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Chat } from '@/types/chat';
import { Message } from '@/types/message';
import '../app/global.css';
import { Delete, DeleteIcon, Send, SendHorizonalIcon, Trash, Trash2 } from 'lucide-react';
import { socket } from '@/lib/socket';
import Profile from './Profile';

interface Props {
  selectedChat: Chat;
  msgs: Message[];
  getFormattedTime: (createdAt?: string) => string;
  setMsgs: React.Dispatch<React.SetStateAction<Message[]>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  isTyping: boolean;
  onlineUsers: string[];
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
}

export default function ChatWindow({
  selectedChat,
  msgs,
  getFormattedTime,
  setMsgs,
  setChats,
  isTyping,
  onlineUsers,
  setSelectedChat,
}: Props) {
  const [msg, setMsg] = useState<string>('');
  const { user, loading } = useAuth();
  const [viewProf, setViewProf] = useState<boolean>(false);

  if (!user?.id) return;

  useEffect(() => {
    const container = document.getElementById('chat-container');
    container?.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [msgs]);

  let typingTimeout: NodeJS.Timeout;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);

    socket.emit('typing', {
      chatId: selectedChat?.id,
      userId: user?.id,
    });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', {
        chatId: selectedChat?.id,
        userId: user?.id,
      });
    }, 3000);
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

    // update messages (optimistic)
    setMsgs((prev) => [...prev, tempMsg]);

    setChats((prevChats) => {
      const safePrev = prevChats.filter(Boolean);

      const exists = safePrev.find((c) => c.id === selectedChat.id);

      // Case 1: existing chat
      if (exists) {
        const updated = safePrev.map((chat) => {
          if (chat.id === selectedChat.id) {
            return {
              ...chat,
              lastMessage: tempMsg,
              updatedAt: tempMsg.createdAt,
            };
          }
          return chat;
        });

        const currentChat = updated.find((c) => c.id === selectedChat.id);
        const rest = updated.filter((c) => c.id !== selectedChat.id);

        if (!currentChat) return updated; // safety

        return [currentChat, ...rest];
      }

      // Case 2: NEW CHAT
      const newChat = {
        ...selectedChat,
        lastMessage: tempMsg,
        updatedAt: tempMsg.createdAt,
      };

      return [newChat, ...safePrev];
    });

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

  const handleViewProfile = () => {
    setViewProf(true);
  };

  const isOnline = onlineUsers.includes(selectedChat?.otherUser?.id);
  return (
    <div className="w-full h-full flex flex-col">
      <div
        onClick={handleViewProfile}
        className="p-4 bg-mist-800 h-18 flex items-center gap-3 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center text-white">
          {!selectedChat?.isGroup ? (
            selectedChat?.otherUser?.profilePic ? (
              <img
                src={selectedChat.otherUser.profilePic}
                alt={selectedChat.otherUser.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center text-xl w-full h-full">
                {selectedChat?.otherUser?.username?.charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center text-xl w-full h-full">
              {selectedChat?.members?.[0]?.username?.charAt(0).toUpperCase() || 'G'}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">
            {!selectedChat?.isGroup ? selectedChat?.otherUser?.username : selectedChat?.name}
          </p>
          {isTyping ? (
            <p className="text-sm text-gray-400">typing...</p>
          ) : (
            !isOnline && (
              <p className="text-xs text-gray-400">
                {selectedChat?.otherUser?.lastSeen
                  ? `last seen ${new Date(selectedChat.otherUser.lastSeen).toLocaleTimeString()}`
                  : 'last seen recently'}
              </p>
            )
          )}
        </div>
      </div>

      {viewProf && (
        <Profile
          setViewProf={setViewProf}
          selectedChat={selectedChat}
          setChats={setChats}
          setSelectedChat={setSelectedChat}
        />
      )}

      {/* Messages */}
      <div id="chat-container" className="flex-1 p-2 overflow-y-auto scrollbar-modern space-y-3">
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${
                msg.senderId !== user?.id
                  ? 'bg-gray-300 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl'
                  : 'bg-green-300 rounded-br-2xl rounded-tl-2xl rounded-bl-2xl'
              } px-3 py-2 max-w-xs`}
            >
              <p className="text-sm text-black">{msg?.content}</p>
              <span className="text-[10px] text-gray-500">{getFormattedTime(msg?.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className=" m-2 flex gap-2 rounded-4xl bg-mist-800">
        <input
          type="text"
          value={msg}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 w-full p-4 text-gray-100 focus:outline-none focus:ring-0"
        />
        <button
          className="bg-green-700 text-white px-6 m-2 rounded-4xl hover:bg-green-800 cursor-pointer"
          onClick={handleSendMsg}
        >
          <SendHorizonalIcon size={20} />
        </button>
      </div>
    </div>
  );
}
