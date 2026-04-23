import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';

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

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const prefix = type === 'profile' ? 'profile' : 'link';
    const filename = `${prefix}_${session.user.id}_${Date.now()}${path.extname(file.name) || '.jpg'}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;

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
