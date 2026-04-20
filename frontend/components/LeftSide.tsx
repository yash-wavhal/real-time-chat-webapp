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
  whoTyping: string;
}

function LeftSide({
  chats,
  handleChatClick,
  getFormattedTime,
  onlineUsers,
  isTyping,
  selectedChat,
  whoTyping,
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
  const [isCreateGrp, setIsCreateGrp] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>('');

  useEffect(() => {
    if (!showUsers) return;

    const fetchUsers = async () => {
      const res = await api.get('/user');
      console.log('yes....');
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
    // GROUP MODE → only select/deselect
    if (isCreateGrp) {
      setSelectedUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
      return;
    }

    // NORMAL MODE → create chat (your existing logic)
    if (loading) return;

    try {
      setLoading(true);

      const res = await api.post('/chat', {
        memberIds: [userId],
      });

      const chat = res.data.chat;
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

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      alert('Select at least 2 users');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/chat', {
        memberIds: selectedUsers,
        name: groupName,
      });

      const chat = res.data.chat;

      handleChatClick(chat, true);

      setFilteredChats((prev) => [chat, ...prev]);

      // reset
      setSelectedUsers([]);
      setShowUsers(false);
      setIsCreateGrp(false);
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
          <div className="w-10 h-10 border-4 border-mist-500 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm text-mist-300">Creating chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <Header
        setShowUsers={setShowUsers}
        showUsers={showUsers}
        setOpen={setOpen}
        open={open}
        handleLogout={handleLogout}
        isCreateGrp={isCreateGrp}
        setIsCreateGrp={setIsCreateGrp}
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

      {showUsers || isCreateGrp ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-mist-900">
            <div className="p-3 text-white font-semibold border-b border-mist-800">
              {isCreateGrp ? 'Create a Group Chat (select users)' : 'Start a New Chat'}
            </div>

            {isCreateGrp && selectedUsers.length >= 2 && (
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-2 bg-mist-900 text-white border border-mist-700 rounded"
                />
              </div>
            )}

            {isCreateGrp && (
              <div className="p-3 border-t border-mist-800">
                <button
                  onClick={handleCreateGroup}
                  className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white py-2 rounded"
                >
                  Create Group ({selectedUsers.length})
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-modern">
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.includes(user.id);

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="cursor-pointer hover:bg-mist-800"
                >
                  <UserList user={user} isSelected={isSelected} isCreateGrp={isCreateGrp} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-modern">
          {filteredChats.map((chat, idx) => {
            const onlineCount =
              chat?.members?.filter((u) => onlineUsers.includes(u.id)).length || 0;

            const isOnline = chat.isGroup
              ? chat.members.some((u) => onlineUsers.includes(u.id))
              : onlineUsers.includes(chat?.otherUser?.id);

            return (
              <div key={chat?.id || idx} onClick={() => handleChatClick(chat)}>
                <ChatList
                  chat={chat}
                  getFormattedTime={getFormattedTime}
                  isOnline={isOnline}
                  isTyping={isTyping}
                  selectedChat={selectedChat}
                  whoTyping={whoTyping}
                  onlineCount={onlineCount}
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
