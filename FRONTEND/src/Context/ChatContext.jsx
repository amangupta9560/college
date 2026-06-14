import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // Maps conversationId -> Object { userId -> boolean }
  const [typingStatus, setTypingStatus] = useState({});

  const activeConversationRef = useRef(null);
  activeConversationRef.current = activeConversation;

  // 1. Fetch conversation sessions list
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const res = await api.get('/api/messages');
      setConversations(res.data.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Fetch conversations on mount / auth state change
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    }
  }, [user, fetchConversations]);

  // 2. Select conversation and fetch history
  const selectConversation = useCallback(async (conversation) => {
    if (!conversation) return;
    setActiveConversation(conversation);
    setLoadingMessages(true);
    
    try {
      const res = await api.get(`/api/messages/${conversation.conversationId}`);
      setMessages(res.data.data.messages || []);
      setHasMore(res.data.data.hasMore || false);

      // Decrement unread count locally
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversation.conversationId
            ? { ...c, unreadCount: 0 }
            : c
        )
      );

      // Join room via socket
      if (socket) {
        socket.emit('join:conversation', { conversationId: conversation.conversationId });

        // Mark last message as read if it is not sent by us
        const lastMsg = res.data.data.messages[res.data.data.messages.length - 1];
        if (lastMsg && lastMsg.sender?._id !== user?._id) {
          socket.emit('message:read', {
            conversationId: conversation.conversationId,
            messageId: lastMsg._id
          });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [socket, user]);

  // 3. Pagination: Fetch older messages
  const fetchMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMore || messages.length === 0) return;
    const oldestId = messages[0]._id;

    try {
      const res = await api.get(
        `/api/messages/${activeConversation.conversationId}?before=${oldestId}`
      );
      const oldMessages = res.data.data.messages || [];
      
      setMessages((prev) => [...oldMessages, ...prev]);
      setHasMore(res.data.data.hasMore || false);
    } catch (error) {
      console.error('Error loading older messages:', error);
    }
  }, [activeConversation, hasMore, messages]);

  // 4. Send a message
  const sendMessage = useCallback((content, type = 'text', mediaURL = '') => {
    if (!socket || !activeConversation) return;

    socket.emit('message:send', {
      conversationId: activeConversation.conversationId,
      type,
      content,
      mediaURL
    });
  }, [socket, activeConversation]);

  // 5. Typing Indicators
  const sendTypingStart = useCallback(() => {
    if (socket && activeConversation) {
      socket.emit('typing:start', { conversationId: activeConversation.conversationId });
    }
  }, [socket, activeConversation]);

  const sendTypingStop = useCallback(() => {
    if (socket && activeConversation) {
      socket.emit('typing:stop', { conversationId: activeConversation.conversationId });
    }
  }, [socket, activeConversation]);

  // 6. Hook up Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const currentActive = activeConversationRef.current;
      
      // If message is for the currently open conversation
      if (currentActive && currentActive.conversationId === message.conversationId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark read immediately if not sent by us
        if (message.sender?._id !== user?._id) {
          socket.emit('message:read', {
            conversationId: message.conversationId,
            messageId: message._id
          });
        }
      }

      // Update conversations list (move to top, update last message and unread count)
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.conversationId === message.conversationId);
        
        if (index !== -1) {
          const updatedConversations = [...prev];
          const conv = updatedConversations[index];
          
          const isCurrentActive = currentActive && currentActive.conversationId === message.conversationId;
          const isFromSelf = message.sender?._id === user?._id;

          updatedConversations[index] = {
            ...conv,
            lastMessage: message,
            unreadCount: (!isCurrentActive && !isFromSelf) ? conv.unreadCount + 1 : conv.unreadCount
          };

          // Re-sort: move the updated conversation to the top
          const [item] = updatedConversations.splice(index, 1);
          return [item, ...updatedConversations];
        } else {
          // If conversation session does not exist in sidebar list, reload list
          fetchConversations();
          return prev;
        }
      });
    };

    const handleReadUpdate = ({ messageId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, readBy } : msg
        )
      );
    };

    const handleTypingUpdate = ({ conversationId, userId, isTyping }) => {
      setTypingStatus((prev) => {
        const convTyping = prev[conversationId] || {};
        return {
          ...prev,
          [conversationId]: {
            ...convTyping,
            [userId]: isTyping
          }
        };
      });
    };

    const handlePresenceOnline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    };

    const handlePresenceOffline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:readUpdate', handleReadUpdate);
    socket.on('typing:update', handleTypingUpdate);
    socket.on('presence:online', handlePresenceOnline);
    socket.on('presence:offline', handlePresenceOffline);

    // Initial query for online status of other users in conversations list
    // We can hit a REST presence endpoint or simply wait for presence broadcasts
    
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:readUpdate', handleReadUpdate);
      socket.off('typing:update', handleTypingUpdate);
      socket.off('presence:online', handlePresenceOnline);
      socket.off('presence:offline', handlePresenceOffline);
    };
  }, [socket, user, fetchConversations]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      messages,
      hasMore,
      loadingConversations,
      loadingMessages,
      onlineUsers,
      typingStatus,
      fetchConversations,
      selectConversation,
      fetchMoreMessages,
      sendMessage,
      sendTypingStart,
      sendTypingStop
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
export default ChatContext;
