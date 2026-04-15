export interface Message {
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
