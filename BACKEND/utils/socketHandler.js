import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

// Map of userId string -> Set of socketId strings (supporting multi-tab connections)
const onlineUsers = new Map();

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;
    if (!user) return;

    const userIdStr = user._id.toString();

    // 1. Add user to online registry
    if (!onlineUsers.has(userIdStr)) {
      onlineUsers.set(userIdStr, new Set());
    }
    onlineUsers.get(userIdStr).add(socket.id);

    // Join user's personal room for real-time notifications
    socket.join(`user_${userIdStr}`);

    // Broadcast online status to everyone
    io.emit('presence:online', { userId: userIdStr });

    console.log(`Socket connected: ${socket.id} (User: ${user.email})`);

    // 2. Event: Join Conversation Room
    socket.on('join:conversation', async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        // Authorize user to join conversation
        let isAuthorized = false;

        // Group chat
        if (conversationId.startsWith('team_')) {
          const teamId = conversationId.replace('team_', '');
          const team = await Team.findById(teamId);
          if (team) {
            isAuthorized = team.members.some(
              (m) => m.user.toString() === userIdStr
            );
          }
        } 
        // 1:1 chat (sorted userIds like uid1_uid2)
        else if (conversationId.includes('_')) {
          const uids = conversationId.split('_');
          isAuthorized = uids.includes(userIdStr);
        }

        if (isAuthorized) {
          socket.join(conversationId);
          console.log(`User ${user.email} joined room: ${conversationId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized to join this conversation' });
        }
      } catch (err) {
        console.error('Error joining room:', err);
      }
    });

    // 3. Event: Send Message
    socket.on('message:send', async ({ conversationId, type, content, mediaURL }) => {
      try {
        if (!conversationId) return;

        // Verify membership
        let isAuthorized = false;
        let recipientIds = [];

        if (conversationId.startsWith('team_')) {
          const teamId = conversationId.replace('team_', '');
          const team = await Team.findById(teamId);
          if (team) {
            isAuthorized = team.members.some((m) => m.user.toString() === userIdStr);
            if (isAuthorized) {
              recipientIds = team.members
                .map((m) => m.user.toString())
                .filter((id) => id !== userIdStr);
            }
          }
        } else if (conversationId.includes('_')) {
          const uids = conversationId.split('_');
          isAuthorized = uids.includes(userIdStr);
          if (isAuthorized) {
            recipientIds = uids.filter((id) => id !== userIdStr);
          }
        }

        if (!isAuthorized) {
          return socket.emit('error', { message: 'Unauthorized to send messages' });
        }

        // Save message to database
        const newMessage = new Message({
          conversationId,
          sender: user._id,
          type: type || 'text',
          content: content || '',
          mediaURL: mediaURL || '',
          readBy: [{ user: user._id }]
        });

        await newMessage.save();
        await newMessage.populate('sender', 'firstName lastName avatar');

        // Broadcast new message to the room
        io.to(conversationId).emit('message:new', newMessage);

        // Send real-time notifications to recipients who are not active in the room
        for (const recipientId of recipientIds) {
          // Send notification payload
          const notificationData = {
            recipient: recipientId,
            type: 'message',
            title: `New message from ${user.firstName}`,
            body: type === 'text' ? (content.length > 60 ? content.substring(0, 60) + '...' : content) : 'Sent an attachment',
            link: '/chat',
            isRead: false,
            metadata: { conversationId, messageId: newMessage._id }
          };

          const newNotification = new Notification(notificationData);
          await newNotification.save();

          // Push through socket if online
          if (onlineUsers.has(recipientId)) {
            io.to(`user_${recipientId}`).emit('notification:new', newNotification);
          }
        }

      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // 4. Event: Mark Message as Read
    socket.on('message:read', async ({ conversationId, messageId }) => {
      try {
        if (!messageId || !conversationId) return;

        const msg = await Message.findById(messageId);
        if (!msg) return;

        const alreadyRead = msg.readBy.some(
          (r) => r.user.toString() === userIdStr
        );

        if (!alreadyRead) {
          msg.readBy.push({ user: user._id, readAt: new Date() });
          await msg.save();

          // Broadcast read receipts update to conversation room
          io.to(conversationId).emit('message:readUpdate', {
            messageId,
            readBy: msg.readBy
          });
        }
      } catch (err) {
        console.error('Error marking message read:', err);
      }
    });

    // 5. Event: Typing Started
    socket.on('typing:start', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('typing:update', {
        conversationId,
        userId: userIdStr,
        isTyping: true
      });
    });

    // 6. Event: Typing Stopped
    socket.on('typing:stop', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('typing:update', {
        conversationId,
        userId: userIdStr,
        isTyping: false
      });
    });

    // 7. Event: Disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const userConnections = onlineUsers.get(userIdStr);
      if (userConnections) {
        userConnections.delete(socket.id);
        if (userConnections.size === 0) {
          onlineUsers.delete(userIdStr);

          // Update user's lastSeen timestamp in DB
          await User.findByIdAndUpdate(userIdStr, { lastSeen: new Date() });

          // Broadcast offline presence
          io.emit('presence:offline', {
            userId: userIdStr,
            lastSeen: new Date()
          });
        }
      }
    });
  });
};

export default socketHandler;
