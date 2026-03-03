"use client";

import { useState } from "react";
import {
  mockUsers,
  type User,
  type Message,
} from "@/app/components/chat/mockData";
import { FaPaperPlane } from "react-icons/fa";
import { HiChat, HiX } from "react-icons/hi";
import Image from "next/image";

const ChatLogPage = () => {
  const [selectedUser, setSelectedUser] = useState<User>(mockUsers[0]);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUser: true,
    };

    setSelectedUser((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: message,
      lastMessageTime: newMessage.time,
    }));

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Chat Logs</h1>
      </div>

      <div className="flex flex-1 gap-4 mt-4 h-[calc(100vh-200px)]">
        {/* Mobile Overlay */}
        {isChatListOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsChatListOpen(false)}
          />
        )}

        {/* Chat List */}
        <div
          className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] lg:w-1/3
          bg-white rounded-2xl lg:rounded-2xl
          shadow-[0px_12px_26px_rgba(239,244,255,1)] border border-[rgba(230,236,241,1)]
          p-4 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${
            isChatListOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <HiChat className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <button
              onClick={() => setIsChatListOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-2">
            {mockUsers.map((user: User) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setIsChatListOpen(false);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedUser.id === user.id
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50 border-transparent"
                } border`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {user.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {user.lastMessage}
                    </p>
                  </div>
                  {user.unread > 0 && (
                    <div className="bg-custom-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {user.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsChatListOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Image
                src={selectedUser.avatar}
                alt={selectedUser.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h2 className="text-lg font-medium">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.status}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {selectedUser.messages.map((message: Message, index: number) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isUser
                      ? "bg-custom-blue text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue resize-none"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-3 bg-custom-blue text-white rounded-lg hover:bg-custom-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLogPage;
