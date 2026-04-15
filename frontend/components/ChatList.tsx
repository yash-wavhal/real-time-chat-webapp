import { Chat } from '@/types/chat';

interface Props {
  chat: Chat;
  getFormattedTime: (createdAt?: string) => string;
}

function ChatList({ chat, getFormattedTime }: Props) {
  if (!chat) return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-b-xl cursor-pointer hover:bg-mist-800 transition border-b border-mist-900">
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
  );
}

export default ChatList;
