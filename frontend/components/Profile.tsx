import { api } from '@/lib/axios';
import { Chat } from '@/types/chat';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  setViewProf: React.Dispatch<React.SetStateAction<boolean>>;
  selectedChat: Chat;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
}

function Profile({ setViewProf, selectedChat, setChats, setSelectedChat }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const handleDeleteChat = async (chatId: string) => {
    setLoading(true);
    try {
      await api.delete('/chat', {
        data: { chatId },
      });

      setSelectedChat(null);

      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err: any) {
      console.log('Error in Deleting Chat: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-mist-500 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm text-mist-300">Deleting chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-mist-950/50" onClick={() => setViewProf(false)} />

      <div className="w-[25%] bg-mist-950 text-white h-full shadow-lg transform transition-transform duration-300">
        <div className="p-4 h-18 border-b border-mist-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button className="cursor-pointer" onClick={() => setViewProf(false)}>
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
            {selectedChat?.otherUser?.profilePic ? (
              <img src={selectedChat.otherUser.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {selectedChat?.otherUser?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-xl font-semibold">{selectedChat?.otherUser?.fullName}</h3>

          <p className="text-gray-400">@{selectedChat?.otherUser?.username}</p>

          <p className="text-sm text-gray-500">
            {selectedChat?.otherUser?.lastSeen
              ? `Last seen ${new Date(selectedChat.otherUser.lastSeen).toLocaleString()}`
              : 'Offline'}
          </p>
        </div>

        <div className="p-4 border-t border-mist-800 flex flex-col gap-4">
          <button
            className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 rounded
                   bg-mist-800 hover:bg-mist-700 transition"
          >
            ⭐ <span>Add to Favorites</span>
          </button>

          <button
            className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 rounded
                   bg-yellow-600 hover:bg-yellow-700 transition"
          >
            🔕 <span>Mute Notifications</span>
          </button>

          <button className="w-full cursor-pointer bg-black/30 text-red-600 hover:bg-red-100/10 py-2 rounded">
            🚫 Block User
          </button>
          <button
            className="w-full flex cursor-pointer bg-black/30 items-center gap-2 px-3 py-2 rounded
                   hover:bg-red-100/10 transition justify-center"
            onClick={() => {
              handleDeleteChat(selectedChat.id);
            }}
          >
            <Trash2 className="text-red-600 w-4 h-4" />

            <span className="text-red-600 font-medium">Delete Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
