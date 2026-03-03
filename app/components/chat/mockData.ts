import { IMAGES } from "@/public/Images/Index";

export interface Message {
  text: string;
  time: string;
  isUser: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
  unread: number;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: IMAGES.PROFILE_IMG,
    status: "Online",
    lastMessage: "I need help with my account access",
    lastMessageTime: "14:30",
    unread: 2,
    messages: [
      {
        text: "I need help with my account access",
        time: "14:30",
        isUser: true,
      },
      {
        text: "I understand you're having trouble accessing your account. Let me help you with that.",
        time: "14:31",
        isUser: false,
      },
      {
        text: "I've reset your password. Please check your email for the new credentials.",
        time: "14:35",
        isUser: false,
      },
    ],
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: IMAGES.PROFILE_IMG,
    status: "Offline",
    lastMessage: "Thank you for your help!",
    lastMessageTime: "15:45",
    unread: 0,
    messages: [
      {
        text: "Hello, I have a question about my recent order",
        time: "15:40",
        isUser: true,
      },
      {
        text: "Of course! I'd be happy to help you with that.",
        time: "15:42",
        isUser: false,
      },
      {
        text: "Thank you for your help!",
        time: "15:45",
        isUser: true,
      },
    ],
  },
]; 