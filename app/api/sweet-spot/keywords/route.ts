import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { dim, keyword } = await req.json().catch(() => ({}));
  // Mock minimal
  return NextResponse.json({
    ok: true,
    received: { dim, keyword },
    suggestion: keyword ? `${keyword}-plus` : 'example',
  });
}
