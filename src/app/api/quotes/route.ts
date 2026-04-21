import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = verifyToken(auth.slice(7));
  return payload?.userId ?? null;
}

/** 获取当前用户的报价列表 */
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const search = req.nextUrl.searchParams.get('q') || '';
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');

  const quotes = await prisma.quote.findMany({
    where: {
      userId,
      ...(search ? {
        OR: [
          { projectName: { contains: search } },
          { partDesc: { contains: search } },
          { tags: { contains: search } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ quotes });
}

/** 保存新报价 */
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const { projectName, partDesc, input, result, features, tags } = await req.json();

    const quote = await prisma.quote.create({
      data: {
        userId,
        projectName: projectName || '未命名报价',
        partDesc: partDesc || '',
        inputJson: JSON.stringify(input),
        resultJson: JSON.stringify(result),
        totalCost: result?.totalCost ?? 0,
        featuresJson: JSON.stringify(features || {}),
        tags: tags || '',
      },
    });

    return NextResponse.json({ quote });
  } catch (err) {
    console.error('Save quote error:', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
