import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext.jsx';
import { useChat } from '../Context/ChatContext.jsx';
import { Send, Image, File, MoreVertical, Trash2, ArrowLeft, Smile, Check, CheckCheck, Flag } from 'lucide-react';
import ReportModal from '../Components/ReportModal.jsx';

export const ChatPage = () => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    hasMore,
    loadingConversations,
    loadingMessages,
    onlineUsers,
    typingStatus,
    selectConversation,
    fetchMoreMessages,
    sendMessage,
    sendTypingStart,
    sendTypingStop
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle typing state
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      sendTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      sendTypingStop();
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendMessage(inputMessage.trim());
    setInputMessage('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
    sendTypingStop();
  };

  const formatMessageTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const isOnline = (recipientId) => {
    return onlineUsers.has(recipientId);
  };

  const getRecipientTypingText = () => {
    if (!activeConversation || activeConversation.type !== 'dm') return null;
    const recipientId = activeConversation.recipient?._id;
    const isRecipientTyping = typingStatus[activeConversation.conversationId]?.[recipientId];
    return isRecipientTyping ? `${activeConversation.recipient?.firstName} is typing...` : null;
  };

  const getTeamTypingText = () => {
    if (!activeConversation || activeConversation.type !== 'team') return null;
    const typingUsers = typingStatus[activeConversation.conversationId] || {};
    const typers = Object.keys(typingUsers)
      .filter(id => id !== user?._id && typingUsers[id])
      .map(id => 'Someone'); // In a complete app, we can fetch name by ID
    
    if (typers.length === 1) return 'Someone is typing...';
    if (typers.length > 1) return 'Multiple users are typing...';
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[85vh] flex gap-4 overflow-hidden">
      
      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-80 shrink-0 bg-base-100 border border-border rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-extrabold text-base-content">Messages</h1>
          <p className="text-xs text-base-content/50 mt-0.5">Connect with your teammates</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {loadingConversations && conversations.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-base-content/40 italic text-xs">
              No active conversations.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeConversation?.conversationId === conv.conversationId;
              const isUserOnline = conv.type === 'dm' && isOnline(conv.recipient?._id);
              
              return (
                <button
                  key={conv.conversationId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all text-left ${isSelected ? 'bg-primary text-primary-content shadow-md shadow-primary/10' : 'hover:bg-base-200'}`}
                >
                  <div className="avatar shrink-0 relative">
                    <div className="w-11 h-11 rounded-full border border-border bg-base-300">
                      <img 
                        src={conv.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.name}`} 
                        alt="Chat Avatar" 
                      />
                    </div>
                    {isUserOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-base-100 rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline">
                      <h2 className="font-extrabold text-xs truncate max-w-[120px]">{conv.name}</h2>
                      {conv.lastMessage && (
                        <span className={`text-[9px] shrink-0 ${isSelected ? 'text-primary-content/70' : 'text-base-content/40'}`}>
                          {formatMessageTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-[10px] truncate ${isSelected ? 'text-primary-content/80' : 'text-base-content/60'}`}>
                        {conv.lastMessage.isDeleted ? (
                          <span className="italic">Message deleted</span>
                        ) : (
                          conv.lastMessage.content
                        )}
                      </p>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="badge badge-sm badge-error shrink-0 font-bold px-1.5 min-w-[20px]">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 bg-base-100 border border-border rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${!activeConversation ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
        
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-base-50">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => selectConversation(null)}
                  className="btn btn-ghost btn-circle btn-sm md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="avatar relative">
                  <div className="w-10 h-10 rounded-full border border-border">
                    <img 
                      src={activeConversation.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activeConversation.name}`} 
                      alt="Active Chat Avatar" 
                    />
                  </div>
                  {activeConversation.type === 'dm' && isOnline(activeConversation.recipient?._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-base-100 rounded-full"></span>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="font-extrabold text-sm truncate">{activeConversation.name}</h2>
                  <span className="text-[9px] text-base-content/40 block mt-0.5">
                    {activeConversation.type === 'team' ? 'Team Channel' : isOnline(activeConversation.recipient?._id) ? 'Active Now' : 'Offline'}
                  </span>
                </div>
              </div>

              <button className="btn btn-ghost btn-circle btn-sm">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-base-50/20">
              
              {hasMore && (
                <button 
                  onClick={fetchMoreMessages}
                  className="btn btn-ghost btn-xs mx-auto text-primary font-bold hover:underline"
                >
                  Load older messages
                </button>
              )}

              {loadingMessages ? (
                <div className="flex-grow flex items-center justify-center">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-2 text-center p-8">
                  <p className="text-sm font-semibold text-base-content/50">Say hello! 👋</p>
                  <p className="text-xs text-base-content/40 max-w-xs">Send a message to start collaborating on your project.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                  
                  return (
                    <div 
                      key={msg._id || index} 
                      className={`chat ${isOwn ? 'chat-end' : 'chat-start'}`}
                    >
                      <div className="chat-image avatar">
                        <div className="w-8 h-8 rounded-full border border-border">
                          <img 
                            src={msg.sender?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.firstName || 'User'}`} 
                            alt="Sender Avatar" 
                          />
                        </div>
                      </div>

                      <div className="chat-header text-[9px] font-bold text-base-content/40 mb-0.5">
                        {!isOwn && `${msg.sender?.firstName || 'Teammate'} `}
                        <time className="font-normal">{formatMessageTime(msg.createdAt)}</time>
                      </div>

                      <div className={`chat-bubble text-xs max-w-md ${isOwn ? 'chat-bubble-primary text-primary-content rounded-br-none' : 'bg-base-200 text-base-content rounded-bl-none'} ${msg.isDeleted ? 'italic text-base-content/40 bg-base-100 border border-border' : ''}`}>
                        {msg.content}
                      </div>

                      <div className="chat-footer opacity-50 text-[8px] flex items-center gap-1.5 mt-0.5">
                        {isOwn ? (
                          <span>
                            {msg.readBy && msg.readBy.length > 1 ? (
                              <CheckCheck size={10} className="text-success" />
                            ) : (
                              <Check size={10} />
                            )}
                          </span>
                        ) : (
                          !msg.isDeleted && (
                            <button 
                              type="button" 
                              onClick={() => setReportingMessage(msg)}
                              className="text-base-content/40 hover:text-danger hover:underline font-bold text-[8px] flex items-center gap-0.5 bg-none border-none p-0"
                              title="Report message"
                            >
                              <Flag size={8} /> Report
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Typing status bar */}
            {(getRecipientTypingText() || getTeamTypingText()) && (
              <div className="px-4 py-1.5 bg-base-50 text-[10px] italic text-base-content/40 flex items-center gap-1 font-semibold">
                <span className="loading loading-dots loading-xs shrink-0 scale-75"></span>
                {getRecipientTypingText() || getTeamTypingText()}
              </div>
            )}

            {/* Input Box */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2 bg-base-100">
              <button type="button" className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-base-content shrink-0">
                <Image size={18} />
              </button>
              
              <input 
                type="text"
                className="input input-bordered rounded-xl text-xs grow h-9 focus:outline-none"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={handleInputChange}
              />

              <button 
                type="submit" 
                disabled={!inputMessage.trim()}
                className="btn btn-primary btn-circle btn-sm shrink-0 shadow-md shadow-primary/20"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-12">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shadow-primary/5">
              <Smile size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your Conversations</h2>
              <p className="text-xs text-base-content/50 max-w-xs mt-1">Select a DM or team channel from the sidebar to start collaborating in real-time!</p>
            </div>
          </div>
        )}
      </div>

      <ReportModal 
        isOpen={!!reportingMessage} 
        onClose={() => setReportingMessage(null)} 
        targetType="message" 
        targetId={reportingMessage?._id} 
      />

    </div>
  );
};

export default ChatPage;
