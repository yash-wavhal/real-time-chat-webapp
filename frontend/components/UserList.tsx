import { OtherUser } from '@/types/user';
import React from 'react'

interface Props {
    user: OtherUser;
}

function UserList({user}: Props) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-b-xl cursor-pointer hover:bg-mist-800 transition border-b border-mist-800">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-mist-600 flex items-center justify-center text-white">
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col w-full">
          <p className="font-medium text-white">{user.username}</p>
          <p className="text-sm text-gray-400 truncate">{user.fullName}</p>
        </div>
      </div>
    );
}

export default UserList
