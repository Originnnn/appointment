'use client';
import { useState } from 'react';
import ChatBox from './ChatBox';

export default function ChatButton({ 
  conversationId,
  currentUser,
  otherUser,
  label = "💬 Nhắn tin"
}) {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
        title={`Nhắn tin với ${otherUser.name}`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">💬</span>
      </button>

      {showChat && (
        <ChatBox
          conversationId={conversationId}
          currentUser={currentUser}
          otherUser={otherUser}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
