import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ads, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, code, position } = await request.json();
    if (!name || !code) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const ad = await prisma.ad.create({
      data: { name, code, position: position || 'banner' }
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }

    await prisma.ad.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
