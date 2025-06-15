const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

// Function to format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// View all stored messages
async function viewStoredMessages() {
  console.log('📱 HRMS Chat System - Stored Messages Viewer');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Get all chats
    const chatsResponse = await axios.get(`${API_BASE_URL}/chats`);
    const chats = chatsResponse.data.data;

    if (chats.length === 0) {
      console.log('📭 No chats found in storage.');
      return;
    }

    console.log(`📊 Total Chats: ${chats.length}`);
    console.log('');

    // Process each chat
    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      console.log(`💬 Chat ${i + 1}: ${chat.chatName}`);
      console.log(`🆔 Chat ID: ${chat.chatId}`);
      console.log(`👥 Type: ${chat.isGroup ? 'Group Chat' : 'Direct Message'}`);
      console.log(`👤 Participants: ${chat.participants?.length || 0}`);
      
      if (chat.participants && chat.participants.length > 0) {
        console.log('   Participants:');
        chat.participants.forEach(participant => {
          const status = participant.isOnline ? '🟢 Online' : '🔴 Offline';
          console.log(`   - ${participant.name} ${status}`);
        });
      }
      
      console.log(`📅 Created: ${formatTime(chat.createdAt || chat.lastMessageTime)}`);
      console.log(`🕐 Last Activity: ${formatTime(chat.lastMessageTime)}`);
      console.log(`💭 Last Message: "${chat.lastMessage}"`);
      console.log('');

      // Get messages for this chat
      try {
        const messagesResponse = await axios.get(`${API_BASE_URL}/chats/${chat.chatId}/messages`);
        const messages = messagesResponse.data.data.messages;

        console.log(`   📨 Messages (${messages.length} total):`);
        console.log('   ' + '-'.repeat(50));

        if (messages.length === 0) {
          console.log('   📭 No messages in this chat.');
        } else {
          messages.forEach((msg, msgIndex) => {
            const time = formatTime(msg.timestamp);
            const messageNumber = msgIndex + 1;
            
            console.log(`   ${messageNumber}. [${time}] ${msg.sender}:`);
            
            if (msg.messageType === 'text') {
              console.log(`      💬 "${msg.text}"`);
            } else if (msg.messageType === 'file') {
              console.log(`      📎 File: ${msg.fileName}`);
              console.log(`         Size: ${formatFileSize(msg.fileSize)}`);
              console.log(`         URL: ${msg.fileUrl}`);
              console.log(`      💬 "${msg.text}"`);
            } else if (msg.messageType === 'image') {
              console.log(`      🖼️ Image: ${msg.fileName}`);
              console.log(`         Size: ${formatFileSize(msg.fileSize)}`);
              console.log(`         URL: ${msg.fileUrl}`);
              console.log(`      💬 "${msg.text}"`);
            }
            
            console.log(`      📖 Read: ${msg.isRead ? 'Yes' : 'No'}`);
            console.log('');
          });
        }
      } catch (error) {
        console.log(`   ❌ Error loading messages: ${error.message}`);
      }

      console.log('   ' + '='.repeat(50));
      console.log('');
    }

    // Summary statistics
    console.log('📈 SUMMARY STATISTICS');
    console.log('-'.repeat(30));
    
    let totalMessages = 0;
    let totalFiles = 0;
    let totalImages = 0;
    let groupChats = 0;
    let directChats = 0;

    for (const chat of chats) {
      if (chat.isGroup) {
        groupChats++;
      } else {
        directChats++;
      }

      try {
        const messagesResponse = await axios.get(`${API_BASE_URL}/chats/${chat.chatId}/messages`);
        const messages = messagesResponse.data.data.messages;
        totalMessages += messages.length;
        
        messages.forEach(msg => {
          if (msg.messageType === 'file') totalFiles++;
          if (msg.messageType === 'image') totalImages++;
        });
      } catch (error) {
        // Skip if error loading messages
      }
    }

    console.log(`📊 Total Messages: ${totalMessages}`);
    console.log(`💬 Text Messages: ${totalMessages - totalFiles - totalImages}`);
    console.log(`📎 File Messages: ${totalFiles}`);
    console.log(`🖼️ Image Messages: ${totalImages}`);
    console.log(`👥 Group Chats: ${groupChats}`);
    console.log(`👤 Direct Chats: ${directChats}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error viewing stored messages:', error.message);
    if (error.response) {
      console.error('📄 Response:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
  }
}

// Run the viewer
console.log('🔍 Loading stored messages...\n');
viewStoredMessages().then(() => {
  console.log('✅ Message viewing completed!');
}).catch((error) => {
  console.error('❌ Viewer failed:', error.message);
});
