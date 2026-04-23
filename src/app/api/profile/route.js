import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, image: true }
    });

    const scores = await prisma.score.findMany({
      where: { userId },
      orderBy: { score: 'desc' }
    });

    const topScore = scores.length > 0 ? scores[0].score : 0;
    const gamesPlayed = scores.length;

    return NextResponse.json({ 
      topScore, 
      gamesPlayed,
      xp: user?.xp || 0,
      level: user?.level || 1,
      image: user?.image || null
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
