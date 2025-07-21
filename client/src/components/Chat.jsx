import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const Chat = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [roomMessages, setRoomMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState({ type: 'global', user: null, room: null });
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Debug: Check if user is passed correctly
  console.log('Chat component user:', user);

  // Get user ID (handle both employeeId and _id)
  const getUserId = () => user?.employeeId || user?._id;

  // Early return if no user
  if (!user) {
    return (
      <div className="flex h-[90vh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Initialize socket connection
  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      console.log('No user ID found:', user);
      return;
    }

    console.log('Initializing socket connection for user:', userId);

    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Join chat with user info
    newSocket.emit('userJoin', {
      userId: userId,
      name: user.name,
      email: user.email,
      image: user.image,
    });

    // Listen for online users updates
    newSocket.on('onlineUsers', (users) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users);
    });

    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      if (message.messageScope === 'global' || message.isGlobal) {
        setMessages(prev => [...prev, message]);
      } else if (message.messageScope === 'private') {
        // Handle private messages
        const chatKey = message.sender._id === userId
          ? message.receiver?._id
          : message.sender._id;

        setPrivateMessages(prev => ({
          ...prev,
          [chatKey]: [...(prev[chatKey] || []), message]
        }));
      } else if (message.messageScope === 'room' && message.chatRoom) {
        // Handle room messages
        setRoomMessages(prev => ({
          ...prev,
          [message.chatRoom._id]: [...(prev[message.chatRoom._id] || []), message]
        }));
      }
      scrollToBottom();
    });

    // Listen for typing indicators
    newSocket.on('userTyping', (data) => {
      if (data.userId !== userId) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    });

    newSocket.on('userStoppedTyping', (data) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Load initial data
  useEffect(() => {
    loadMessages();
    loadUsers();
    loadChatRooms();
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, privateMessages, roomMessages]);

  // Load global messages
  const loadMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat/messages', {
        withCredentials: true,
      });
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const response = await axios.get('http://localhost:5000/api/chat/users', {
        withCredentials: true,
      });
      console.log('Users response:', response.data);
      if (response.data.success) {
        setAllUsers(response.data.data);
        console.log('All users loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      const userId = getUserId();
      const response = await axios.get(`http://localhost:5000/api/chat/rooms?userId=${userId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setChatRooms(response.data.data);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  // Load private messages
  const loadPrivateMessages = async (targetUserId) => {
    try {
      const currentUserId = getUserId();
      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/private/${targetUserId}?currentUserId=${currentUserId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setPrivateMessages(prev => ({
          ...prev,
          [targetUserId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading private messages:', error);
    }
  };

  // Load room messages
  const loadRoomMessages = async (roomId) => {
    try {
      const userId = getUserId();
      const response = await axios.get(
        `http://localhost:5000/api/chat/rooms/${roomId}/messages?userId=${userId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setRoomMessages(prev => ({
          ...prev,
          [roomId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading room messages:', error);
    }
  };

  // Select chat function
  const selectChat = (type, chatUser = null, room = null) => {
    setSelectedChat({ type, user: chatUser, room });
    setShowMobileSidebar(false); // Close mobile sidebar when selecting a chat

    if (type === 'private' && chatUser) {
      loadPrivateMessages(chatUser._id);
      if (socket) {
        socket.emit('joinRoom', { roomId: null, userId: getUserId() });
      }
    } else if (type === 'room' && room) {
      loadRoomMessages(room._id);
      if (socket) {
        socket.emit('joinRoom', { roomId: room._id, userId: getUserId() });
      }
    }
  };

  // Send message function
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      senderId: getUserId(),
      content: newMessage.trim(),
      messageType: 'text',
      isGlobal: selectedChat.type === 'global',
      receiverId: selectedChat.type === 'private' ? selectedChat.user._id : null,
      chatRoomId: selectedChat.type === 'room' ? selectedChat.room._id : null,
      messageScope: selectedChat.type,
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');

    // Clear typing indicator
    if (isTyping) {
      socket.emit('stopTyping', {
        userId: getUserId(),
        chatType: selectedChat.type,
        roomId: selectedChat.room?._id,
      });
      setIsTyping(false);
    }
  };

  // Handle typing
  const handleTyping = (value) => {
    setNewMessage(value);

    if (!socket) return;

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        userId: getUserId(),
        userName: user.name,
        chatType: selectedChat.type,
        roomId: selectedChat.room?._id,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('stopTyping', {
          userId: getUserId(),
          chatType: selectedChat.type,
          roomId: selectedChat.room?._id,
        });
      }
    }, 1000);
  };

  // Get current messages based on selected chat
  const getCurrentMessages = () => {
    if (selectedChat.type === 'global') {
      return messages;
    } else if (selectedChat.type === 'private' && selectedChat.user) {
      return privateMessages[selectedChat.user._id] || [];
    } else if (selectedChat.type === 'room' && selectedChat.room) {
      return roomMessages[selectedChat.room._id] || [];
    }
    return [];
  };

  return (
    <div className="flex h-[90vh] border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg relative">
      {/* Mobile Chat Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors btn-touch"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedChat.type === 'global' ? 'Global Chat' :
           selectedChat.type === 'private' ? selectedChat.user?.name :
           selectedChat.room?.name}
        </h2>
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {showMobileSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative lg:flex
        w-[280px] lg:w-[320px] h-full
        border-r border-gray-200 bg-gray-50
        flex flex-col z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
      `}>
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-gray-200 bg-white flex-shrink-0 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Chat</h2>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Chat */}
        <div className="p-2 lg:p-3">
          <div
            className={`flex items-center gap-3 p-2 lg:p-3 rounded-lg cursor-pointer transition-all btn-touch ${
              selectedChat.type === 'global'
                ? 'bg-cyan-500 text-white'
                : 'hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => selectChat('global')}
          >
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              🌐
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Global Chat</p>
              <p className="text-sm opacity-75 truncate">Everyone can see</p>
            </div>
          </div>
        </div>

        {/* Chat Rooms Section */}
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Chat Rooms</h3>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="text-cyan-500 hover:text-cyan-600 text-sm font-medium"
            >
              New
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {chatRooms.map((room) => (
              <div
                key={room._id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  selectedChat.type === 'room' && selectedChat.room?._id === room._id
                    ? 'bg-cyan-500 text-white'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => selectChat('room', null, room)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {room.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{room.name}</p>
                  <p className="text-xs opacity-75">{room.memberCount || 0} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Section */}
        <div className="flex-1 px-3 pb-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Users</h3>
          <div className="space-y-1 overflow-y-auto">
            {allUsers
              .filter(chatUser => chatUser._id !== getUserId())
              .map((chatUser) => {
                const isOnline = onlineUsers.some(onlineUser => onlineUser.userId === chatUser._id);
                return (
                  <div
                    key={chatUser._id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedChat.type === 'private' && selectedChat.user?._id === chatUser._id
                        ? 'bg-cyan-500 text-white'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => selectChat('private', chatUser)}
                  >
                    <div className="relative">
                      <img
                        src={chatUser.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                        alt={chatUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{chatUser.name}</p>
                      <p className="text-xs opacity-75">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 pt-16 lg:pt-0">
        {/* Chat Header - Hidden on mobile */}
        <div className="hidden lg:block p-3 lg:p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            {selectedChat.type === 'global' && (
              <>
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  🌐
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base lg:text-lg text-gray-800 truncate">Global Chat</h3>
                  <p className="text-sm text-gray-500 truncate">Everyone can see these messages</p>
                </div>
              </>
            )}

            {selectedChat.type === 'private' && selectedChat.user && (
              <>
                <img
                  src={selectedChat.user.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                  alt={selectedChat.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{selectedChat.user.name}</h3>
                  <p className="text-sm text-gray-500">Private conversation</p>
                </div>
              </>
            )}

            {selectedChat.type === 'room' && selectedChat.room && (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedChat.room.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{selectedChat.room.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.room.memberCount || 0} members</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {getCurrentMessages().map((message, index) => {
              const isOwnMessage = message.sender._id === getUserId();
              return (
                <div
                  key={message._id || index}
                  className={`flex items-start gap-3 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      src={message.sender.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full object-cover mt-1"
                    />
                  )}

                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-cyan-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {!isOwnMessage && selectedChat.type !== 'private' && (
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {message.sender.name}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-cyan-100' : 'text-gray-500'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {isOwnMessage && (
                    <img
                      src={user.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                      alt={user.name}
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
                <span>Someone is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-3 lg:p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-3 lg:px-4 py-2 lg:py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent btn-touch text-sm lg:text-base"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 lg:px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-touch text-sm lg:text-base flex-shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-90vw max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Chat Room</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const roomData = {
                name: formData.get('name'),
                description: formData.get('description'),
                isPrivate: formData.get('isPrivate') === 'on',
                adminId: getUserId(),
              };

              try {
                const response = await axios.post('http://localhost:5000/api/chat/rooms', roomData, {
                  withCredentials: true,
                });
                if (response.data.success) {
                  // Add selected users to the room
                  const selectedUserIds = Array.from(document.querySelectorAll('input[name="selectedUsers"]:checked'))
                    .map(checkbox => checkbox.value);

                  // Add users to room one by one
                  for (const userId of selectedUserIds) {
                    try {
                      await axios.post(`http://localhost:5000/api/chat/rooms/${response.data.data._id}/join`, {
                        userId: userId
                      }, { withCredentials: true });
                    } catch (joinError) {
                      console.error('Error adding user to room:', joinError);
                    }
                  }

                  await loadChatRooms();
                  setShowCreateRoom(false);
                  selectChat('room', null, response.data.data);
                }
              } catch (error) {
                console.error('Error creating room:', error);
                alert('Failed to create room: ' + (error.response?.data?.error || error.message));
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter room name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter room description (optional)"
                />
              </div>

              {/* Add Users Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Users to Room
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {allUsers
                    .filter(u => u._id !== getUserId())
                    .map((chatUser) => {
                      const isOnline = onlineUsers.some(onlineUser => onlineUser.userId === chatUser._id);
                      return (
                        <label key={chatUser._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            name="selectedUsers"
                            value={chatUser._id}
                            className="rounded"
                          />
                          <div className="relative">
                            <img
                              src={chatUser.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                              alt={chatUser.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-2 h-2 border border-white rounded-full ${
                              isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{chatUser.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  {allUsers.filter(u => u._id !== getUserId()).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No other users available</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Private room (invite only)</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
