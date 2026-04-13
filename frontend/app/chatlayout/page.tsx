'use client';

import { api } from '@/lib/axios';
import React, { useEffect, useState } from 'react';

interface Chat {
  id: string;
  createdAt: Date;
  isGroup: boolean;
  updatedAt: Date;
  otherUser: {
    id: string;
    username: string;
    fullName: string;
    profilePic: string;
    email: string;
  };
}

export default function Page() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get(`/chat`);
        setChats(res.data.formattedChats);
      } catch (err) {
        console.log('Error fetching chats');
      }
    };
    fetchChats();
  }, []);

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-[30%] bg-black text-white border-r border-gray-800">
        <div className="p-4 text-xl font-semibold border-b border-gray-700">Chats</div>

        <div className="overflow-y-auto h-full">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition"
            >
              {/* Profile Pic */}
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                {chat?.otherUser?.username[0].toUpperCase()}
              </div>

              {/* Chat Info */}
              <div className="flex flex-col w-full">
                <div className="flex justify-between">
                  <p className="font-medium">{chat?.otherUser?.username}</p>
                  <span className="text-xs text-gray-400">
                    {/* Placeholder time */}
                    12:30 PM
                  </span>
                </div>

                <p className="text-sm text-gray-400 truncate">
                  {/* Placeholder last message */}
                  Last message...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (CHAT WINDOW) */}
      <div className="w-[70%] bg-white flex items-center justify-center">
        {selectedChat ? (
          <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                {selectedChat?.otherUser?.username[0].toUpperCase()}
              </div>
              <p className="font-semibold">{selectedChat?.otherUser?.username}</p>
            </div>

            {/* Messages (empty for now) */}
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-gray-500">Start chatting...</p>
            </div>

            {/* Input Box */}
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border p-2 rounded"
              />
              <button className="bg-black text-white px-4 rounded">Send</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
}
