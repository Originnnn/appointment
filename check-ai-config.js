#!/usr/bin/env node

/**
 * Script kiểm tra cấu hình AI Chatbot
 * Chạy: node check-ai-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra cấu hình AI Medical Assistant...\n');

// 1. Check .env.local file
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 File .env.local:', envExists ? '✅ Tồn tại' : '❌ KHÔNG tồn tại');

let hasGeminiKey = false;

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check GEMINI_API_KEY
  hasGeminiKey = envContent.includes('GEMINI_API_KEY');
  console.log('🔑 GEMINI_API_KEY:', hasGeminiKey ? '✅ Đã cấu hình' : '❌ CHƯA cấu hình');
  
  if (hasGeminiKey) {
    const keyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (keyMatch) {
      const key = keyMatch[1].trim().replace(/['"]/g, '');
      
      if (key === 'your_api_key_here' || key === 'YOUR_API_KEY_HERE' || key === '') {
        console.log('   ⚠️  API key chưa được thay thế bằng key thực');
      } else if (key.startsWith('AIza')) {
        console.log('   ✅ API key có định dạng đúng (AIza...)');
        console.log('   📏 Độ dài:', key.length, 'ký tự');
      } else {
        console.log('   ⚠️  API key có định dạng lạ (nên bắt đầu bằng AIza)');
      }
    }
  }
  
  // Check Supabase
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('🗄️  Supabase URL:', hasSupabaseUrl ? '✅' : '❌');
  console.log('🗄️  Supabase Key:', hasSupabaseKey ? '✅' : '❌');
  
} else {
  console.log('\n❌ Thiếu file .env.local!');
  console.log('\n📝 Hướng dẫn tạo file:');
  console.log('1. Tạo file .env.local trong thư mục root');
  console.log('2. Thêm nội dung:');
  console.log('   GEMINI_API_KEY=your_key_here');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
}

console.log('\n' + '='.repeat(50));

// 2. Check component files
const aiChatbotPath = path.join(__dirname, 'components', 'AIChatbot.js');
const aiRouterPath = path.join(__dirname, 'app', 'api', 'ai-chat', 'route.js');

console.log('\n📦 Kiểm tra files:');
console.log('   AIChatbot.js:', fs.existsSync(aiChatbotPath) ? '✅' : '❌');
console.log('   api/ai-chat/route.js:', fs.existsSync(aiRouterPath) ? '✅' : '❌');

console.log('\n' + '='.repeat(50));

// 3. Check package.json dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasGemini = packageJson.dependencies?.['@google/generative-ai'];
  
  console.log('\n📚 Dependencies:');
  console.log('   @google/generative-ai:', hasGemini ? `✅ ${hasGemini}` : '❌ CHƯA cài đặt');
  
  if (!hasGemini) {
    console.log('\n   ⚠️  Cần chạy: npm install @google/generative-ai');
  }
}

console.log('\n' + '='.repeat(50));

// Summary
console.log('\n📊 TÓM TẮT:');

if (!envExists) {
  console.log('❌ CẦN TẠO FILE .env.local');
  console.log('\n🔗 Lấy API key tại: https://makersuite.google.com/app/apikey');
} else if (!hasGeminiKey) {
  console.log('❌ CẦN THÊM GEMINI_API_KEY vào .env.local');
  console.log('\n🔗 Lấy API key tại: https://makersuite.google.com/app/apikey');
} else {
  console.log('✅ Cấu hình cơ bản đã sẵn sàng!');
  console.log('\n📝 Tiếp theo:');
  console.log('   1. Chạy: npm run dev');
  console.log('   2. Login vào dashboard');
  console.log('   3. Click nút tím AI Assistant');
  console.log('   4. Kiểm tra Console nếu có lỗi');
}

console.log('\n💡 Debug tips:');
console.log('   - Xem Console browser (F12)');
console.log('   - Xem Terminal server logs');
console.log('   - Test API: http://localhost:3001/api/ai-chat');
console.log('   - Restart server sau khi sửa .env.local\n');
