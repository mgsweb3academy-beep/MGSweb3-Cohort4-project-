import { NextRequest, NextResponse } from 'next/server';
import { createRecommendation } from '@/lib/ai-service';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? 'user_demo';
  return NextResponse.json(createRecommendation(userId));
}
