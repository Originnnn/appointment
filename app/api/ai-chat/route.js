import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
  console.error('❌ GEMINI_API_KEY is not configured properly in .env.local');
}

const genAI = new GoogleGenerativeAI(apiKey || 'YOUR_API_KEY_HERE');

// System prompt cho AI Medical Assistant
const SYSTEM_PROMPT = `Bạn là trợ lý y tế AI thông minh của hệ thống quản lý lịch hẹn y tế. 

VAI TRÒ CỦA BẠN:
- Tư vấn sức khỏe, giải đáp thắc mắc y tế cơ bản
- Gợi ý bác sĩ phù hợp dựa trên triệu chứng
- Phân tích hồ sơ bệnh án và đưa ra insights
- Hướng dẫn đặt lịch khám, chuẩn bị trước khám

NGUYÊN TẮC:
1. Luôn nhấn mạnh: "Thông tin chỉ mang tính tham khảo, không thay thế ý kiến bác sĩ"
2. Khuyến khích đặt lịch khám với bác sĩ khi triệu chứng nghiêm trọng
3. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu
4. Thân thiện, chuyên nghiệp, đầy đủ thông tin
5. Không đưa ra chẩn đoán chắc chắn hoặc kê đơn thuốc

KHI ĐƯỢC HỎI VỀ TRIỆU CHỨNG:
- Phân tích mức độ nghiêm trọng
- Gợi ý chuyên khoa phù hợp (Tim mạch, Nhi khoa, Da liễu, etc)
- Khuyên đặt lịch nếu cần thiết

ĐỊNH DẠNG TRẢ LỜI:
- Sử dụng emoji phù hợp: 🏥💊💉🩺❤️🧠👨‍⚕️👩‍⚕️
- Chia thành các điểm bullet khi cần
- Highlight từ khóa quan trọng
- Kết thúc với call-to-action (đặt lịch, tư vấn thêm, etc)`;

export async function POST(request) {
  try {
    // Check API key
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.error('❌ GEMINI_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'API key not configured',
          message: 'Vui lòng cấu hình GEMINI_API_KEY trong file .env.local và restart server'
        },
        { status: 500 }
      );
    }

    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI Chat Request:', { message: message.substring(0, 50) + '...' });

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context-aware prompt
    let fullPrompt = SYSTEM_PROMPT + '\n\n';

    // Add user context if available
    if (context) {
      fullPrompt += '=== CONTEXT NGƯỜI DÙNG ===\n';
      
      if (context.userName) {
        fullPrompt += `Tên bệnh nhân: ${context.userName}\n`;
      }
      
      if (context.userAge) {
        fullPrompt += `Tuổi: ${context.userAge}\n`;
      }
      
      if (context.userGender) {
        fullPrompt += `Giới tính: ${context.userGender}\n`;
      }

      // Add doctors info for recommendations
      if (context.doctors && context.doctors.length > 0) {
        fullPrompt += '\n=== DANH SÁCH BÁC SĨ CÓ SẴN ===\n';
        context.doctors.forEach(doc => {
          fullPrompt += `- ${doc.full_name} - Chuyên khoa: ${doc.specialty}\n`;
          if (doc.description) {
            fullPrompt += `  Mô tả: ${doc.description}\n`;
          }
        });
      }

      // Add medical history if available
      if (context.medicalHistory && context.medicalHistory.length > 0) {
        fullPrompt += '\n=== LỊCH SỬ KHÁM BỆNH ===\n';
        context.medicalHistory.forEach(record => {
          fullPrompt += `- ${record.date}: ${record.diagnosis}\n`;
          if (record.treatment) {
            fullPrompt += `  Điều trị: ${record.treatment}\n`;
          }
        });
      }

      // Add upcoming appointments
      if (context.upcomingAppointments && context.upcomingAppointments.length > 0) {
        fullPrompt += '\n=== LỊCH HẸN SẮP TỚI ===\n';
        context.upcomingAppointments.forEach(apt => {
          fullPrompt += `- ${apt.date} ${apt.time} với ${apt.doctorName} (${apt.specialty})\n`;
        });
      }

      fullPrompt += '\n';
    }

    fullPrompt += `=== CÂU HỎI CỦA BỆNH NHÂN ===\n${message}\n\n`;
    fullPrompt += `Hãy trả lời câu hỏi trên với vai trò trợ lý y tế AI, dựa trên context đã cung cấp.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ AI Response generated successfully');

    return NextResponse.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Chat Error:', error.message);
    console.error('Error details:', error);
    
    // Check for specific Gemini API errors
    let errorMessage = 'Không thể kết nối với AI Assistant. Vui lòng thử lại sau.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong .env.local';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API đã hết quota. Vui lòng kiểm tra lại Google AI Studio.';
    } else if (error.message?.includes('SAFETY')) {
      errorMessage = 'Nội dung không phù hợp. Vui lòng thử câu hỏi khác.';
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response',
        message: errorMessage,
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = apiKey && apiKey !== 'YOUR_API_KEY_HERE';
  
  return NextResponse.json({
    status: hasApiKey ? 'ok' : 'error',
    service: 'AI Medical Assistant',
    model: 'gemini-pro',
    apiKeyConfigured: hasApiKey,
    message: hasApiKey 
      ? 'Service is ready' 
      : 'GEMINI_API_KEY not configured. Please add it to .env.local and restart server',
    timestamp: new Date().toISOString()
  });
}
