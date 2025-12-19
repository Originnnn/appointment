'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

export default function ChatBox({ 
  conversationId,
  currentUser, // { id, name, type: 'patient' or 'doctor' }
  otherUser,   // { id, name, type: 'patient' or 'doctor' }
  onClose 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load tin nhắn ban đầu - useCallback để tránh re-create
  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Load tin nhắn khi conversation thay đổi
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => {
            // Tránh duplicate message
            if (prev.find(m => m.message_id === payload.new.message_id)) {
              return prev;
            }
            return [...prev, payload.new];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_type: currentUser.type,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          message_text: messageText,
        }]);

      if (error) {
        console.error('Error sending message:', error);
        alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const diffHours = diff / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Chat box */}
      <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[440px] h-[100vh] md:h-[650px] bg-white md:rounded-3xl shadow-2xl flex flex-col z-50 border-t md:border border-gray-200 animate-slideIn overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-5 md:rounded-t-3xl flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/50 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{otherUser.name}</h3>
              <p className="text-xs text-emerald-50 flex items-center">
                <span className="w-2 h-2 bg-green-300 rounded-full mr-1.5 animate-pulse"></span>
                {otherUser.type === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-full -mr-2"
            aria-label="Đóng chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-teal-200 rounded-full animate-ping"></div>
                <div className="relative w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-gray-600">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-xs px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800 text-lg mb-2">Bắt đầu trò chuyện</p>
              <p className="text-sm text-gray-500">Gửi tin nhắn để bắt đầu cuộc hội thoại với {otherUser.name}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isCurrentUser = msg.sender_type === currentUser.type && msg.sender_id === currentUser.id;
              return (
                <div 
                  key={msg.message_id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`max-w-[85%] md:max-w-[78%] flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {/* Avatar */}
                    {!isCurrentUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md mb-1">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className={`flex-1 ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
                      {!isCurrentUser && (
                        <p className="text-xs font-semibold text-gray-600 mb-1 px-1">
                          {msg.sender_name}
                        </p>
                      )}
                      <div className={`rounded-2xl p-3.5 shadow-md ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-md' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.message_text}</p>
                      </div>
                      <div className={`flex items-center mt-1.5 px-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <svg className={`w-3 h-3 mr-1 ${isCurrentUser ? 'text-teal-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>
                    </div>

                    {isCurrentUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md mb-1">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gradient-to-r from-gray-50 to-white md:rounded-b-3xl shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={sending}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:bg-gray-100 text-sm placeholder:text-gray-400 transition-all shadow-sm"
              autoComplete="off"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
              onClick={() => {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl hover:from-teal-600 hover:to-cyan-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-medium"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="hidden sm:inline">Gửi</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
