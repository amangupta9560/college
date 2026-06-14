import Message from '../models/Message.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

export const getConversationHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { before, limit = 20 } = req.query;
    const userId = req.user._id.toString();

    // 1. Authorize user for this conversation
    let isAuthorized = false;

    if (conversationId.startsWith('team_')) {
      const teamId = conversationId.replace('team_', '');
      const team = await Team.findById(teamId);
      if (team) {
        isAuthorized = team.members.some(
          (m) => m.user.toString() === userId
        );
      }
    } else if (conversationId.includes('_')) {
      const uids = conversationId.split('_');
      isAuthorized = uids.includes(userId);
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a participant in this conversation.' });
    }

    // 2. Build query
    const query = { conversationId };

    // Before message ID cursor for pagination
    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages sorted desc by createdAt
    const parsedLimit = parseInt(limit, 10);
    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parsedLimit + 1); // Fetch 1 extra to check hasMore

    const hasMore = messages.length > parsedLimit;
    if (hasMore) {
      messages.pop(); // Remove the extra item
    }

    // Return messages in chronological order for frontend convenience
    messages.reverse();

    return res.status(200).json({
      success: true,
      data: {
        messages,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    // Check ownership
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own messages.' });
    }

    // Check 60 minutes window limit
    const diffMs = Date.now() - new Date(message.createdAt).getTime();
    const diffMins = diffMs / (1000 * 60);

    if (diffMins > 60) {
      return res.status(400).json({ success: false, message: 'Messages can only be deleted within 60 minutes of sending.' });
    }

    // Soft delete
    message.isDeleted = true;
    // Clear content/media for privacy
    message.content = 'Message deleted';
    message.mediaURL = '';
    await message.save();

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationsList = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // 1. Fetch all teams the user is member of (group chats)
    const teams = await Team.find({ 'members.user': req.user._id });
    const teamConversationIds = teams.map((t) => `team_${t._id.toString()}`);

    // 2. Fetch all unique 1:1 conversationIds from Messages where the user is a participant
    const uniqueDMs = await Message.distinct('conversationId', {
      conversationId: { $regex: userId }
    });

    const allConversationIds = [...teamConversationIds, ...uniqueDMs];

    const conversations = [];

    // 3. For each conversation ID, fetch the latest message and context details
    for (const conversationId of allConversationIds) {
      const lastMessage = await Message.findOne({ conversationId })
        .populate('sender', 'firstName lastName avatar')
        .sort({ createdAt: -1 });

      // Calculate unread count for this conversation
      const unreadCount = await Message.countDocuments({
        conversationId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      });

      if (conversationId.startsWith('team_')) {
        const teamId = conversationId.replace('team_', '');
        const team = teams.find((t) => t._id.toString() === teamId) || await Team.findById(teamId);
        
        if (team) {
          conversations.push({
            conversationId,
            type: 'team',
            name: team.name,
            avatar: team.avatarURL || '',
            lastMessage,
            unreadCount
          });
        }
      } else {
        const participantIds = conversationId.split('_');
        const recipientId = participantIds.find((id) => id !== userId);
        const recipient = await User.findById(recipientId).select('firstName lastName avatar availability lastSeen');

        if (recipient) {
          conversations.push({
            conversationId,
            type: 'dm',
            name: `${recipient.firstName} ${recipient.lastName}`,
            avatar: recipient.avatar || '',
            recipient,
            lastMessage,
            unreadCount
          });
        }
      }
    }

    // Sort conversations by latest message's createdAt desc
    conversations.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};
