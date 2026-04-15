import { Message } from './message';
import { OtherUser } from './user';

export interface Chat {
  id: string;
  createdAt: string;
  isGroup: boolean;
  updatedAt: string;
  name: string;
  otherUser: OtherUser;
  members: OtherUser[];
  lastMessage: Message;
}
