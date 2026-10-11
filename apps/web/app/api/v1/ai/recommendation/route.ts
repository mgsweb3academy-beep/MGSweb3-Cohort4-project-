import { guardAI } from '@/lib/ai-access';
import { NextRequest, NextResponse } from 'next/server';
import { createRecommendation } from '@/lib/ai-service';

export async function GET(req: NextRequest) {
  const denied = await guardAI(undefined);
  if (denied) return denied;
  const userId = req.nextUrl.searchParams.get('userId') ?? 'user_demo';
  return NextResponse.json(createRecommendation(userId));
}
