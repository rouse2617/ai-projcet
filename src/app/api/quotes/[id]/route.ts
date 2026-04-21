import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = verifyToken(auth.slice(7));
  return payload?.userId ?? null;
}

/** 删除报价 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;

  const quote = await prisma.quote.findFirst({ where: { id, userId } });
  if (!quote) return NextResponse.json({ error: '报价不存在' }, { status: 404 });

  await prisma.quote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

/** 获取单条报价 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;

  const quote = await prisma.quote.findFirst({ where: { id, userId } });
  if (!quote) return NextResponse.json({ error: '报价不存在' }, { status: 404 });

  return NextResponse.json({ quote });
}
