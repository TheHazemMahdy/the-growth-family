import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const type = formData.get('type');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'File too large. Maximum size is 2MB.' }, { status: 400 });
    }

    // Determine MIME type from file name or default to jpeg
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    const mimeMap = {
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
    };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    // Convert to base64 data URL
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${mimeType};base64,${base64}`;

    if (type === 'profile') {
      await prisma.user.update({
        where: { id: parseInt(session.user.id) },
        data: { image: imageUrl }
      });
    }

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}

