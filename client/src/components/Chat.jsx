import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "tailwindcss";

import user1 from '../assets/user1.jpg';
import user2 from '../assets/user2.jpg';
import user3 from '../assets/user3.png';
import user4 from '../assets/user4.jpeg';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const SOCKET_URL = 'http://localhost:8080';

const myAvatar = user2;
const currentUser = 'You';

export default function ChatSystem() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('newMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom();
    });

    socketRef.current.on('typingStatus', ({ usersTyping }) => {
      setTypingUsers(usersTyping.filter(user => user !== currentUser));
    });

    socketRef.current.on('userOnline', ({ userName }) => {
      setOnlineUsers(prev => new Set([...prev, userName]));
    });

    socketRef.current.on('userOffline', ({ userName }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userName);
        return newSet;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Join chat room when selected chat changes
  useEffect(() => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit('join', {
        chatId: selectedChat.chatId,
        userId: currentUser,
        userName: currentUser
      });
      loadMessages(selectedChat.chatId);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all chats
  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats`);
      if (response.data.success) {
        setChats(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedChat(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a specific chat
  const loadMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${chatId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a text message
  const sendMessage = async () => {
    if (input.trim() === '' || !selectedChat) return;

    try {
      const messageData = {
        sender: currentUser,
        text: input.trim(),
        senderAvatar: myAvatar
      };

      // Send to backend
      const response = await axios.post(
        `${API_BASE_URL}/chats/${selectedChat.chatId}/messages`,
        messageData
      );

      if (response.data.success) {
        // Emit to socket for real-time updates
        socketRef.current?.emit('sendMessage', {
          chatId: selectedChat.chatId,
          message: response.data.data
        });

        setInput('');

        // Stop typing indicator
        handleTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file || !selectedChat) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sender', currentUser);
      formData.append('senderAvatar', myAvatar);

      const response = await axios.post(
        `${API_BASE_URL}/chats/${selectedChat.chatId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Emit to socket for real-time updates
        socketRef.current?.emit('fileUploaded', {
          chatId: selectedChat.chatId,
          message: response.data.data
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle typing indicators
  const handleTyping = (typing) => {
    if (!selectedChat || !socketRef.current) return;

    setIsTyping(typing);

    socketRef.current.emit('typing', {
      chatId: selectedChat.chatId,
      userName: currentUser,
      isTyping: typing
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (e.target.value.trim() && !isTyping) {
      handleTyping(true);
    } else if (!e.target.value.trim() && isTyping) {
      handleTyping(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get avatar for user
  const getAvatarForUser = (userName) => {
    const avatarMap = {
      'Josh Cummins': user4,
      'Ben Jamin Lee': user1,
      'Sam': user3,
      'Priya': user1,
      'You': user2
    };
    return avatarMap[userName] || user2;
  };

  if (isLoading) {
    return (
      <div className="flex h-[90vh] items-center justify-center">
        <div className="text-center">
          <i className="fa fa-spinner fa-spin text-4xl text-cyan-500 mb-4"></i>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Sidebar */}
      <div className="w-[270px] border-r border-gray-200 bg-gray-50 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Messages</h3>
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded hover:bg-gray-200 text-gray-600"
            >
              <i className="fa fa-bars text-lg" />
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-md rounded z-10">
                <ul className="text-sm">
                  {['Unread Chats', 'Contacts', 'Groups', 'Drafts', 'Non-contacts'].map((item, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => alert(`Filter selected: ${item}`)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Chats List */}
        <ul className="space-y-2 overflow-y-auto">
          {chats.map((chat) => (
            <li
              key={chat.chatId}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
                selectedChat?.chatId === chat.chatId
                  ? 'bg-cyan-500 text-white'
                  : 'hover:bg-cyan-100 text-gray-800'
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="relative">
                <img
                  src={getAvatarForUser(chat.chatName)}
                  alt={chat.chatName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                {/* Online indicator */}
                {onlineUsers.has(chat.chatName) && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{chat.chatName}</span>
                  {chat.isGroup && (
                    <i className="fa fa-users text-xs ml-1"></i>
                  )}
                </div>
                <p className="text-xs opacity-75 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
                <p className="text-xs opacity-60">
                  {formatTime(chat.lastMessageTime)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-6">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b pb-4 mb-5">
              <div className="relative">
                <img
                  src={getAvatarForUser(selectedChat.chatName)}
                  alt={selectedChat.chatName}
                  className="w-11 h-11 rounded-full object-cover"
                />
                {/* Online indicator */}
                {onlineUsers.has(selectedChat.chatName) && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {selectedChat.chatName}
                  {selectedChat.isGroup && (
                    <i className="fa fa-users text-sm text-gray-500"></i>
                  )}
                </h3>
                <div className="text-sm text-gray-600">
                  {onlineUsers.has(selectedChat.chatName) ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    <span>Last seen recently</span>
                  )}
                  {selectedChat.isGroup && (
                    <span className="ml-2">
                      • {selectedChat.participants?.length || 0} members
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto border border-gray-100 p-5 mb-5 rounded-md bg-gray-50 space-y-4">
              {messages.map((msg, index) => {
                const isYou = msg.sender === currentUser;
                const isGroup = selectedChat.isGroup;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex items-start gap-3 ${
                      isYou ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Avatar for incoming messages */}
                    {!isYou && (
                      <img
                        src={getAvatarForUser(msg.sender)}
                        alt={msg.sender}
                        className="w-8 h-8 rounded-full object-cover mt-1"
                      />
                    )}

                    <div
                      className={`px-4 py-3 rounded-lg max-w-[70%] shadow-sm ${
                        isYou
                          ? 'bg-cyan-500 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {/* Sender name for group chats */}
                      {!isYou && isGroup && (
                        <div className="text-sm font-semibold text-cyan-600 mb-1">
                          {msg.sender}
                        </div>
                      )}

                      {/* Message content */}
                      {msg.messageType === 'file' || msg.messageType === 'image' ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <i className={`fa ${msg.messageType === 'image' ? 'fa-image' : 'fa-file'} text-sm`}></i>
                            <span className="text-sm">{msg.fileName}</span>
                          </div>
                          {msg.messageType === 'image' ? (
                            <img
                              src={`http://localhost:8080${msg.fileUrl}`}
                              alt={msg.fileName}
                              className="max-w-full h-auto rounded-md cursor-pointer"
                              onClick={() => window.open(`http://localhost:8080${msg.fileUrl}`, '_blank')}
                            />
                          ) : (
                            <a
                              href={`http://localhost:8080${msg.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-300 hover:underline text-sm"
                            >
                              Download {msg.fileName}
                            </a>
                          )}
                        </div>
                      ) : (
                        <div>{msg.text}</div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-xs mt-1 ${isYou ? 'text-cyan-100' : 'text-gray-500'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>

                    {/* Your avatar on the right */}
                    {isYou && (
                      <img
                        src={myAvatar}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover mt-1"
                      />
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>
                    {typingUsers.length === 1
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.join(', ')} are typing...`
                    }
                  </span>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-100">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 p-3 rounded-md border border-gray-300 bg-white text-gray-700 outline-none focus:border-cyan-500"
                disabled={isUploading}
              />

              <label className={`text-xl cursor-pointer transition-colors ${
                isUploading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-cyan-500'
              }`}>
                <i className={`fa ${isUploading ? 'fa-spinner fa-spin' : 'fa-paperclip'}`} />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv"
                  disabled={isUploading}
                />
              </label>

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isUploading}
                className="p-3 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fa fa-paper-plane text-lg" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <i className="fa fa-comments text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
              <p>Choose a conversation from the sidebar to begin chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
