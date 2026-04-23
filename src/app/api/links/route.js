import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error('API Links Error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newLink = await prisma.link.create({
      data: {
        title: data.title,
        desc: data.desc,
        icon: data.icon,
        url: data.url,
        isInternal: data.isInternal || false,
        order: data.order || 0
      }
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID required' }, { status: 400 });
    }

    await prisma.link.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
