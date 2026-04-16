import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ChatList from './ChatList';
import { Chat } from '@/types/chat';
import { OtherUser } from '@/types/user';
import UserList from './UserList';
import Header from './Header';
import SearchBar from './SearchBar';
import { socket } from '@/lib/socket';
import { useAuth } from './context/AuthContext';

interface Props {
  chats: Chat[];
  handleChatClick: (chat: Chat, isNewChat?: boolean) => void;
  getFormattedTime: (createdAt?: string) => string;
  onlineUsers: string[];
  isTyping: boolean;
  selectedChat: Chat | null;
}

function LeftSide({
  chats,
  handleChatClick,
  getFormattedTime,
  onlineUsers,
  isTyping,
  selectedChat,
}: Props) {
  const router = useRouter();

  const { user } = useAuth();

  const [users, setUsers] = useState<OtherUser[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [chatSearch, setChatSearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats);
  const [filteredUsers, setFilteredUsers] = useState<OtherUser[]>(users);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!showUsers) return;

    const fetchUsers = async () => {
      const res = await api.get('/user');
      setFilteredUsers(res.data);
      setUsers(res.data);
    };

    fetchUsers();
  }, [showUsers]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await api.post('/auth/logout');
      router.replace('/login');
    } catch (err: any) {
      console.log('Error in logout', err.message);
    }
  };

  useEffect(() => {
    setFilteredChats(chats);
  }, [chats]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (showUsers) {
      setUserSearch(value);

      const filtered = users.filter((user) => {
        return (
          user.username.toLowerCase().includes(value) || user.fullName.toLowerCase().includes(value)
        );
      });

      setFilteredUsers(filtered);
    } else {
      setChatSearch(value);

      const filtered = chats.filter((chat) => {
        if (!chat.isGroup) {
          return chat.otherUser.username.toLowerCase().includes(value);
        } else {
          return chat.name.toLowerCase().includes(value);
        }
      });

      setFilteredChats(filtered);
    }
  };

  const handleUserClick = async (userId: string) => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await api.post('/chat', {
        otherUserId: userId,
      });

      const chat = res.data.chat;
      // console.log("chat", chat);
      const isNewChat = res.data.isNewChat;

      handleChatClick(chat, isNewChat);

      setShowUsers(false);

      setFilteredChats((prev) => {
        const exists = prev.some((c) => c.id === chat.id);
        if (exists) return prev;
        return [chat, ...prev];
      });
    } catch (err: any) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-500 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm text-gray-300">Creating chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        setShowUsers={setShowUsers}
        showUsers={showUsers}
        setOpen={setOpen}
        open={open}
        handleLogout={handleLogout}
      />

      <SearchBar
        value={showUsers ? userSearch : chatSearch}
        handleChange={handleChange}
        placeholder={showUsers ? 'Search users...' : 'Search chats...'}
        showClear={!!(chatSearch || userSearch)}
        onClear={() => {
          setUserSearch('');
          setChatSearch('');
          setFilteredChats(chats);
          setFilteredUsers(users);
        }}
      />

      {showUsers ? (
        <div className="overflow-y-auto scrollbar-modern">
          <div className="p-3 text-white font-semibold border-b border-gray-800">
            Start a New Chat
          </div>
          {filteredUsers.map((user) => (
            <div key={user.id} onClick={() => handleUserClick(user.id)}>
              <UserList user={user} />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-y-auto scrollbar-modern">
          {filteredChats.map((chat, idx) => {
            const isOnline = onlineUsers.includes(chat?.otherUser?.id);
            return (
              <div
                key={chat?.id || idx}
                onClick={() => {
                  handleChatClick(chat);
                }}
              >
                <ChatList
                  chat={chat}
                  getFormattedTime={getFormattedTime}
                  isOnline={isOnline}
                  isTyping={isTyping}
                  selectedChat={selectedChat}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LeftSide;
