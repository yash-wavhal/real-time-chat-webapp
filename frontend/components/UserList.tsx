interface Props {
  user: any;
  isSelected?: boolean;
  isCreateGrp?: boolean;
}

const UserList = ({ user, isSelected, isCreateGrp }: Props) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-b-xl transition border-b border-mist-800
      ${isSelected ? 'bg-mist-800' : ''}`}
    >
      {/* Avatar */}
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
      <div className="flex flex-col flex-1">
        <p className="font-medium text-white">{user.username}</p>
        <p className="text-sm text-mist-400 truncate">{user.fullName}</p>
      </div>

      {/* Tick */}
      {isCreateGrp && isSelected && <span className="text-green-500 text-lg font-bold">✔</span>}
    </div>
  );
};

export default UserList;
