const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

// Test the chat API endpoints
async function testChatAPI() {
  console.log('🧪 Testing Chat API Endpoints\n');

  try {
    // 1. Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`);
    console.log('✅ Health check:', healthResponse.data.message);
    console.log('');

    // 2. Get all chats
    console.log('2. Getting all chats...');
    const chatsResponse = await axios.get(`${API_BASE_URL}/chats`);
    console.log('✅ Chats retrieved:', chatsResponse.data.data.length, 'chats found');
    
    if (chatsResponse.data.data.length > 0) {
      console.log('📋 Available chats:');
      chatsResponse.data.data.forEach((chat, index) => {
        console.log(`   ${index + 1}. ${chat.chatName} (${chat.isGroup ? 'Group' : 'Direct'}) - ${chat.messages?.length || 0} messages`);
        console.log(`      Last message: "${chat.lastMessage}"`);
        console.log(`      Last message time: ${new Date(chat.lastMessageTime).toLocaleString()}`);
      });
      console.log('');

      // 3. Get messages for the first chat
      const firstChat = chatsResponse.data.data[0];
      console.log(`3. Getting messages for chat: ${firstChat.chatName}...`);
      const messagesResponse = await axios.get(`${API_BASE_URL}/chats/${firstChat.chatId}/messages`);
      console.log('✅ Messages retrieved:', messagesResponse.data.data.messages.length, 'messages found');
      
      console.log('💬 Recent messages:');
      messagesResponse.data.data.messages.slice(-5).forEach((msg, index) => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        console.log(`   [${time}] ${msg.sender}: ${msg.text}`);
        if (msg.messageType !== 'text') {
          console.log(`      📎 File: ${msg.fileName} (${msg.messageType})`);
        }
      });
      console.log('');

      // 4. Send a test message
      console.log('4. Sending a test message...');
      const testMessage = {
        sender: 'API Test User',
        text: `Test message sent at ${new Date().toLocaleString()}`,
        senderAvatar: '/assets/user2.jpg'
      };

      const sendResponse = await axios.post(
        `${API_BASE_URL}/chats/${firstChat.chatId}/messages`,
        testMessage
      );
      console.log('✅ Message sent successfully!');
      console.log('📤 Sent message:', sendResponse.data.data.text);
      console.log('');

      // 5. Verify the message was added
      console.log('5. Verifying message was added...');
      const updatedMessagesResponse = await axios.get(`${API_BASE_URL}/chats/${firstChat.chatId}/messages`);
      const newMessageCount = updatedMessagesResponse.data.data.messages.length;
      console.log('✅ Updated message count:', newMessageCount);
      
      const lastMessage = updatedMessagesResponse.data.data.messages[newMessageCount - 1];
      console.log('📨 Last message:', lastMessage.text);
      console.log('👤 Sender:', lastMessage.sender);
      console.log('⏰ Timestamp:', new Date(lastMessage.timestamp).toLocaleString());
      console.log('');

      // 6. Create a new chat
      console.log('6. Creating a new test chat...');
      const newChat = {
        chatId: 'test-chat-' + Date.now(),
        chatName: 'API Test Chat',
        isGroup: false,
        participants: [
          {
            name: 'API Test User',
            avatar: '/assets/user2.jpg',
            isOnline: true,
            lastSeen: new Date()
          },
          {
            name: 'Test Recipient',
            avatar: '/assets/user1.jpg',
            isOnline: false,
            lastSeen: new Date()
          }
        ]
      };

      const createChatResponse = await axios.post(`${API_BASE_URL}/chats`, newChat);
      console.log('✅ New chat created:', createChatResponse.data.data.chatName);
      console.log('🆔 Chat ID:', createChatResponse.data.data.chatId);
      console.log('');

      // 7. Send a message to the new chat
      console.log('7. Sending message to new chat...');
      const newChatMessage = {
        sender: 'API Test User',
        text: 'Hello! This is the first message in our new chat.',
        senderAvatar: '/assets/user2.jpg'
      };

      await axios.post(
        `${API_BASE_URL}/chats/${newChat.chatId}/messages`,
        newChatMessage
      );
      console.log('✅ Message sent to new chat!');
      console.log('');

      // 8. Get updated chats list
      console.log('8. Getting updated chats list...');
      const updatedChatsResponse = await axios.get(`${API_BASE_URL}/chats`);
      console.log('✅ Updated chats count:', updatedChatsResponse.data.data.length);
      console.log('');

    } else {
      console.log('⚠️ No chats found. The in-memory storage might be empty.');
      console.log('💡 Try refreshing the frontend to trigger chat loading.');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('📄 Response data:', error.response.data);
      console.error('📊 Status code:', error.response.status);
    }
  }
}

// Run the test
console.log('🚀 Starting Chat API Test...\n');
testChatAPI().then(() => {
  console.log('✅ Chat API test completed!');
}).catch((error) => {
  console.error('❌ Test failed:', error.message);
});
