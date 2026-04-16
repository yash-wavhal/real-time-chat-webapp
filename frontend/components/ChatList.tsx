import { Chat } from '@/types/chat';

interface Props {
  chat: Chat;
  getFormattedTime: (createdAt?: string) => string;
  isOnline: boolean;
  isTyping: boolean;
  selectedChat: Chat | null;
}

function ChatList({ chat, getFormattedTime, isOnline, isTyping, selectedChat }: Props) {
  if (!chat) return null;
  return (
    <div className="relative flex items-center gap-3 p-3 rounded-b-xl cursor-pointer hover:bg-mist-800 transition border-b border-mist-900">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center text-white">
        {!chat?.isGroup ? (
          chat?.otherUser?.profilePic ? (
            <img
              src={chat?.otherUser?.profilePic}
              alt={chat?.otherUser?.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center text-xl w-full h-full">
              {chat?.otherUser?.username?.charAt(0).toUpperCase()}
            </div>
          )
        ) : (
          <div className="flex items-center justify-center text-xl w-full h-full">
            {chat?.members?.[0]?.username?.charAt(0).toUpperCase() || 'G'}
          </div>
        )}
        {!chat?.isGroup && isOnline && (
          <span className="absolute left-9 bottom-2 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
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
          selectedChat?.id === chat?.id && isTyping ? (
            <p className="text-sm text-gray-500">typing...</p>
          ) : (
            <p className="text-sm text-gray-400 truncate">{chat?.lastMessage?.content}</p>
          )
        ) : (
          <p className="text-sm text-gray-400 truncate">
            {chat?.lastMessage?.sender?.username}: {chat?.lastMessage?.content}
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatList;
