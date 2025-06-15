const mongoose = require('mongoose');
require('dotenv').config();

const Chat = require('./models/Chat');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_events');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleChats = [
  {
    chatId: 'chat-josh-cummins',
    chatName: 'Josh Cummins',
    isGroup: false,
    participants: [
      {
        name: 'Josh Cummins',
        avatar: '/assets/user4.jpeg',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        name: 'You',
        avatar: '/assets/user2.jpg',
        isOnline: true,
        lastSeen: new Date()
      }
    ],
    messages: [
      {
        sender: 'Josh Cummins',
        senderAvatar: '/assets/user4.jpeg',
        text: 'Hey there! How are you doing?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: true
      },
      {
        sender: 'You',
        senderAvatar: '/assets/user2.jpg',
        text: 'Hi Josh! I\'m doing great, thanks for asking. How about you?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        isRead: true
      },
      {
        sender: 'Josh Cummins',
        senderAvatar: '/assets/user4.jpeg',
        text: 'I\'m good too! Are you free for a quick call later?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false
      }
    ],
    lastMessage: 'I\'m good too! Are you free for a quick call later?',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    chatId: 'chat-ben-jamin-lee',
    chatName: 'Ben Jamin Lee',
    isGroup: false,
    participants: [
      {
        name: 'Ben Jamin Lee',
        avatar: '/assets/user1.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        name: 'You',
        avatar: '/assets/user2.jpg',
        isOnline: true,
        lastSeen: new Date()
      }
    ],
    messages: [
      {
        sender: 'Ben Jamin Lee',
        senderAvatar: '/assets/user1.jpg',
        text: 'Are you coming for lunch today?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        isRead: true
      },
      {
        sender: 'You',
        senderAvatar: '/assets/user2.jpg',
        text: 'Yes, I\'ll be there around 12:30. Where are we meeting?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
        isRead: true
      },
      {
        sender: 'Ben Jamin Lee',
        senderAvatar: '/assets/user1.jpg',
        text: 'Let\'s meet at the usual place - the cafeteria on the 2nd floor.',
        messageType: 'text',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        isRead: false
      }
    ],
    lastMessage: 'Let\'s meet at the usual place - the cafeteria on the 2nd floor.',
    lastMessageTime: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    chatId: 'chat-team-devs',
    chatName: 'Team Devs',
    isGroup: true,
    participants: [
      {
        name: 'Sam',
        avatar: '/assets/user3.png',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        name: 'Priya',
        avatar: '/assets/user1.jpg',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        name: 'You',
        avatar: '/assets/user2.jpg',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        name: 'Josh Cummins',
        avatar: '/assets/user4.jpeg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ],
    messages: [
      {
        sender: 'Sam',
        senderAvatar: '/assets/user3.png',
        text: 'Hey team! I\'ve uploaded the latest project documentation.',
        messageType: 'text',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true
      },
      {
        sender: 'Sam',
        senderAvatar: '/assets/user3.png',
        text: 'Shared a file: Project_Requirements_v2.pdf',
        messageType: 'file',
        fileUrl: '/uploads/sample-document.pdf',
        fileName: 'Project_Requirements_v2.pdf',
        fileSize: 2048576,
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
        isRead: true
      },
      {
        sender: 'Priya',
        senderAvatar: '/assets/user1.jpg',
        text: 'Thanks Sam! This looks comprehensive. Nice work!',
        messageType: 'text',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: true
      },
      {
        sender: 'You',
        senderAvatar: '/assets/user2.jpg',
        text: 'Agreed! The requirements are very clear. When do we start implementation?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isRead: true
      },
      {
        sender: 'Sam',
        senderAvatar: '/assets/user3.png',
        text: 'We can start next Monday. I\'ll create the initial project structure over the weekend.',
        messageType: 'text',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        isRead: false
      }
    ],
    lastMessage: 'We can start next Monday. I\'ll create the initial project structure over the weekend.',
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000)
  }
];

const addSampleData = async () => {
  try {
    await connectDB();
    
    // Clear existing chat data
    await Chat.deleteMany({});
    console.log('🗑️ Cleared existing chat data');
    
    // Insert sample chats
    await Chat.insertMany(sampleChats);
    console.log('✅ Sample chat data added successfully');
    
    console.log(`📊 Added ${sampleChats.length} sample chats:`);
    sampleChats.forEach(chat => {
      console.log(`   - ${chat.chatName} (${chat.isGroup ? 'Group' : 'Direct'}) - ${chat.messages.length} messages`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
addSampleData();
