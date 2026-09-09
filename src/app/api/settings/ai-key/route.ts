import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const isConfigured = Boolean(apiKey && apiKey.trim() && apiKey !== 'your-gemini-api-key-here');

    let isValid = false;
    let testError = '';

    if (isConfigured) {
      try {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const res = await model.generateContent('ping');
        if (res.response) {
          isValid = true;
        }
      } catch (e: any) {
        testError = e.message || 'Failed to authenticate with Gemini API';
      }
    }

    const maskedKey = isConfigured
      ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
      : null;

    return NextResponse.json({
      success: true,
      data: {
        isConfigured,
        isValid,
        maskedKey,
        model: 'gemini-1.5-flash',
        testError: testError || undefined,
      },
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = (body.apiKey || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API Key is required.' },
        { status: 400 }
      );
    }

    // 1. Live test API key against Gemini
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
      const pingTest = await model.generateContent('Say "OK" to test connection.');
      const text = pingTest.response.text();
      if (!text) {
        throw new Error('No response from Gemini model');
      }
    } catch (testErr: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API Key validation failed: ${testErr.message || 'Invalid key'}`,
        },
        { status: 400 }
      );
    }

    // 2. Set runtime environment variable
    process.env.GEMINI_API_KEY = apiKey;

    // 3. Persist to .env file if available
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('GEMINI_API_KEY=')) {
          envContent = envContent.replace(
            /GEMINI_API_KEY=.*/,
            `GEMINI_API_KEY="${apiKey}"`
          );
        } else {
          envContent += `\nGEMINI_API_KEY="${apiKey}"\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf8');
      }
    } catch (fsErr) {
      console.warn('Could not write to .env file, saved in runtime:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gemini API Key successfully validated and saved! Real AI is now active for email generation.',
      data: {
        isValid: true,
        maskedKey: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
        model: 'gemini-1.5-flash',
      },
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
