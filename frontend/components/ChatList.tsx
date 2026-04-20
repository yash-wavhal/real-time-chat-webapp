import { Chat } from '@/types/chat';

interface Props {
  chat: Chat;
  getFormattedTime: (createdAt?: string) => string;
  isOnline: boolean;
  isTyping: boolean;
  selectedChat: Chat | null;
  whoTyping: string;
  onlineCount: number;
}

function ChatList({
  chat,
  getFormattedTime,
  isOnline,
  isTyping,
  selectedChat,
  whoTyping,
  onlineCount,
}: Props) {
  if (!chat) return null;
  return (
    <div className="relative flex items-center gap-3 p-3 rounded-b-xldjnjjndjnj cursor-pointer hover:bg-mist-800 transition border-b border-mist-900">
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
        {isOnline && (
          <div className="group inline-block">
            <span className="absolute w-3 h-3 left-9 bottom-2 bg-green-500 rounded-full cursor-pointer"></span>

            <div className="absolute left-13 top-14 hidden group-hover:block bg-black border border-white text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">
              {chat.isGroup ? `${onlineCount} online` : 'online'}
            </div>
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

        {selectedChat?.id === chat?.id && isTyping ? (
          !chat.isGroup ? (
            <p className="text-sm text-gray-500">typing...</p>
          ) : (
            <p className="text-sm text-gray-500">{whoTyping}: typing...</p>
          )
        ) : !chat.isGroup ? (
          <p className="text-sm text-gray-400 truncate">{chat?.lastMessage?.content}</p>
        ) : (
          <p className="text-sm text-gray-400 truncate">
            {chat?.lastMessage?.sender?.username}: {chat?.lastMessage?.content}
          </p>
        )}
      </div>
      {(chat.unreadCount ?? 0) > 0 && (
        <span className="bg-green-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">
          {chat.unreadCount}
        </span>
      )}
    </div>
  );
}

export default ChatList;
