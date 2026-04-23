import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      orderBy: { score: 'desc' },
      take: 10,
      include: {
        user: {
          select: { username: true }
        }
      }
    });

    const formattedScores = scores.map((s, index) => ({
      rank: index + 1,
      username: s.user.username,
      score: s.score
    }));

    return NextResponse.json(formattedScores, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { score } = await request.json();

    if (typeof score !== 'number') {
      return NextResponse.json({ message: 'Invalid score' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    
    // Fix: findFirst because userId is no longer unique
    const existingScore = await prisma.score.findFirst({
      where: { userId }
    });

    let resultScore;
    if (existingScore) {
      if (score > existingScore.score) {
        resultScore = await prisma.score.update({
          where: { id: existingScore.id },
          data: { score }
        });
      } else {
        resultScore = existingScore;
      }
    } else {
      resultScore = await prisma.score.create({
        data: {
          score,
          userId
        }
      });
    }

    // Update User XP and Level
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newXp = user.xp + score;
      const newLevel = Math.floor(newXp / 1000) + 1; // 1000 XP per level

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: newLevel
        }
      });
    }

    return NextResponse.json(resultScore, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
