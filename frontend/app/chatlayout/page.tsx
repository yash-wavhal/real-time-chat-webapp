'use client';

import ChatWindow from '@/components/ChatWindow';
import { useAuth } from '@/components/context/AuthContext';
import { useSocket } from '@/components/context/SocketContext';
import { api } from '@/lib/axios';
import { socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

export default function Page() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get(`/chat`);
        // console.log("res.data.formattedChats", res.data);
        setChats(res.data.formattedChats);
      } catch (err) {
        console.log('Error fetching chats');
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: any) => {
      console.log('socket msg:', newMsg);
      // console.log('Receiver socket id:', socket.id);

      // only for current chat
      if (newMsg.chatId !== selectedChat?.id) return;

      // ignore own message (already added optimistically)
      if (newMsg.senderId === user?.id) return;

      // avoid duplicates
      setMsgs((prev) => {
        const exists = prev.some((msg) => msg.id === newMsg.id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedChat?.id, user?.id]);

  const handleChatClick = async (chat: Chat) => {
    try {
      setSelectedChat(chat);
      // console.log('chat.otherUser.id', chat.otherUser.id);

      // Open below commented code when you allow new users to chat
      // const otherUserId = chat.otherUser.id;
      // const res = await api.post('/chat', {
      //   otherUserId: otherUserId,
      // });
      // console.log("chat creation: ", res.data);
      // if (!res.data.isNewChat) {

      const messages = await api.get(`/message/${chat.id}`);
      console.log('messages:', messages.data.messages);
      setMsgs(messages.data.messages);
      // }
    } catch (err: any) {
      console.log('Error Fetching msgs for chat c', err.message);
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

  const router = useRouter();
  const handleLogout = async () => {
    setOpen(false);
    try {
      await api.post("/auth/logout");
      router.replace("/login");
    } catch (err: any) {
      console.log("Error in logout", err.message);
    }
  }

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-[30%] bg-black text-white border-r border-gray-800">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center relative">
          <p className="text-xl font-semibold text-white">Chats</p>
          <div className="relative">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="text-white text-xl px-2 hover:rounded-4xl hover:bg-gray-600 cursor-pointer"
            >
              ⋮
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-md">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                handleChatClick(chat);
              }}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition"
            >
              {/* Profile Pic */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center text-white">
                {chat?.otherUser?.profilePic ? (
                  <img
                    src={chat.otherUser.profilePic}
                    alt={chat.otherUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl">
                    {' '}
                    {chat?.members[0]?.username?.charAt(0).toUpperCase()}{' '}
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex flex-col w-full">
                <div className="flex justify-between">
                  {!chat.isGroup ? (
                    <p className="font-medium">{chat?.otherUser?.username}</p>
                  ) : (
                    <p className="font-medium">{chat?.name}</p>
                  )}

                  <span className="text-xs text-gray-400">
                    {chat.lastMessage && getFormattedTime(chat?.lastMessage?.createdAt)}
                  </span>
                </div>

                {!chat.isGroup ? (
                  <p className="text-sm text-gray-400 truncate">{chat?.lastMessage?.content}</p>
                ) : (
                  <p className="text-sm text-gray-400 truncate">
                    {chat?.lastMessage?.sender?.username}: {chat?.lastMessage?.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (CHAT WINDOW) */}
      <div className="w-[70%] bg-white flex items-center justify-center">
        {selectedChat ? (
          <ChatWindow
            selectedChat={selectedChat}
            msgs={msgs}
            getFormattedTime={getFormattedTime}
            setMsgs={setMsgs}
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
