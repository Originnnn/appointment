import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Test 1: Check API key exists
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({
        status: 'error',
        test: 'API Key Check',
        result: 'FAILED',
        message: 'API key not configured',
        apiKey: apiKey ? 'exists but invalid' : 'not found'
      });
    }

    // Test 2: Check API key format
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({
        status: 'error',
        test: 'API Key Format',
        result: 'FAILED',
        message: 'API key should start with "AIza"',
        keyPrefix: apiKey.substring(0, 4)
      });
    }

    // Test 3: Initialize Gemini
    let genAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        test: 'Gemini Initialization',
        result: 'FAILED',
        message: error.message
      });
    }

    // Test 4: Get model
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        test: 'Get Model',
        result: 'FAILED',
        message: error.message
      });
    }

    // Test 5: Generate simple content
    try {
      const result = await model.generateContent('Say hello in Vietnamese');
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({
        status: 'success',
        test: 'Full Test',
        result: 'PASSED',
        message: 'AI is working!',
        sampleResponse: text,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return NextResponse.json({
        status: 'error',
        test: 'Generate Content',
        result: 'FAILED',
        message: error.message,
        errorType: error.constructor.name,
        details: {
          message: error.message,
          stack: error.stack?.split('\n')[0]
        }
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      test: 'Unknown',
      result: 'FAILED',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
