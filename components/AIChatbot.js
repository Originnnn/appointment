'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function AIChatbot({ user, patient, doctors, appointments, medicalRecords }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeName = patient?.full_name || 'bạn';
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `Xin chào ${welcomeName}! 👋\n\nTôi là trợ lý y tế AI của bạn. Tôi có thể giúp bạn:\n\n🏥 Tư vấn về triệu chứng sức khỏe\n👨‍⚕️ Gợi ý bác sĩ phù hợp\n📋 Phân tích hồ sơ bệnh án\n📅 Hướng dẫn đặt lịch khám\n\nHãy cho tôi biết bạn cần hỗ trợ gì nhé!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, patient]);

  const buildContext = () => {
    const context = {};

    if (patient) {
      context.userName = patient.full_name;
      context.userGender = patient.gender;
      
      if (patient.date_of_birth) {
        const birthDate = new Date(patient.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        context.userAge = age;
      }
    }

    if (doctors && doctors.length > 0) {
      context.doctors = doctors.map(doc => ({
        full_name: doc.full_name,
        specialty: doc.specialty,
        description: doc.description
      }));
    }

    if (medicalRecords && medicalRecords.length > 0) {
      context.medicalHistory = medicalRecords.map(record => ({
        date: record.appointment_date,
        diagnosis: record.diagnosis,
        treatment: record.treatment
      }));
    }

    if (appointments && appointments.length > 0) {
      const upcoming = appointments.filter(apt => 
        new Date(apt.appointment_date) >= new Date() && 
        apt.status !== 'cancelled'
      );
      if (upcoming.length > 0) {
        context.upcomingAppointments = upcoming.map(apt => ({
          date: apt.appointment_date,
          time: apt.appointment_time,
          doctorName: apt.doctor_name,
          specialty: apt.specialty,
          status: apt.status
        }));
      }
    }

    return context;
  };

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const context = buildContext();
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          context: context
        })
      });

      const data = await response.json();

      setIsTyping(false);

      if (response.ok && data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Show detailed error message from API
        const errorText = data.message || data.error || 'Failed to get response';
        throw new Error(errorText);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Create user-friendly error message
      let errorText = '😔 Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn.';
      
      if (error.message?.includes('API key')) {
        errorText += '\n\n⚠️ **Lỗi cấu hình API key**\n\nVui lòng:\n1. Kiểm tra file `.env.local`\n2. Đảm bảo GEMINI_API_KEY đã được cấu hình\n3. Restart server (Ctrl+C rồi npm run dev)';
      } else if (error.message?.includes('quota')) {
        errorText += '\n\n⚠️ **Đã hết quota API**\n\nAPI key của bạn đã hết quota miễn phí. Vui lòng kiểm tra tại Google AI Studio.';
      } else if (error.message?.includes('configured')) {
        errorText += '\n\n⚠️ **Chưa cấu hình API key**\n\nVui lòng:\n1. Tạo file `.env.local`\n2. Thêm: GEMINI_API_KEY=your_key_here\n3. Restart server';
      } else {
        errorText += '\n\nVui lòng thử lại sau hoặc kiểm tra kết nối internet.';
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error(error.message || 'Không thể kết nối với AI Assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { icon: '🤒', text: 'Tôi bị sốt và ho', action: 'Tôi đang bị sốt và ho. Tôi nên khám chuyên khoa nào?' },
    { icon: '💊', text: 'Tư vấn dùng thuốc', action: 'Tôi có nên dùng thuốc gì không?' },
    { icon: '👨‍⚕️', text: 'Gợi ý bác sĩ', action: 'Bác sĩ nào phù hợp với triệu chứng của tôi?' },
    { icon: '📋', text: 'Xem hồ sơ của tôi', action: 'Phân tích hồ sơ bệnh án của tôi' }
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group"
        aria-label="Mở AI Assistant"
      >
        <div className="relative">
          <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Overlay backdrop - mobile only */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Chat container */}
      <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[480px] h-[100vh] md:h-[700px] bg-white md:rounded-3xl shadow-2xl flex flex-col z-50 border-t md:border border-gray-200 animate-slideIn overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white p-5 md:rounded-t-3xl flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/50 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Medical Assistant</h3>
              <p className="text-xs text-purple-100 flex items-center">
                <span className="w-2 h-2 bg-green-300 rounded-full mr-1.5 animate-pulse"></span>
                Powered by Google Gemini
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-full -mr-2"
            aria-label="Đóng chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 via-white to-pink-50/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions - show only if no messages yet */}
        {messages.length === 1 && (
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">💡 Gợi ý câu hỏi:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(q.action)}
                  className="text-left px-3 py-2 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <span className="mr-1">{q.icon}</span>
                  <span className="text-gray-700">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-end space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              rows="1"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="shrink-0 w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            💡 Thông tin chỉ mang tính tham khảo, không thay thế ý kiến bác sĩ
          </p>
        </div>
      </div>
    </>
  );
}
