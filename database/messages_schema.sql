-- Tạo bảng messages để lưu tin nhắn
CREATE TABLE IF NOT EXISTS messages (
  message_id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(50) NOT NULL, -- 'patient' hoặc 'doctor'
  sender_id INTEGER NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);

-- Index để tăng tốc độ truy vấn
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);

-- Enable realtime cho bảng messages
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Comment
COMMENT ON TABLE messages IS 'Bảng lưu trữ tin nhắn giữa bệnh nhân và bác sĩ';
COMMENT ON COLUMN messages.conversation_id IS 'ID cuộc hội thoại (format: patient_{id}_doctor_{id})';
COMMENT ON COLUMN messages.sender_type IS 'Loại người gửi: patient hoặc doctor';
COMMENT ON COLUMN messages.sender_id IS 'ID của người gửi';
