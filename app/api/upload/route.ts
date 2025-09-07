import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 1MB' },
        { status: 400 }
      );
    }

    // For now, we'll return a placeholder URL
    // In a real application, you would upload to a service like AWS S3, Cloudinary, etc.
    const fileName = `${Date.now()}-${file.name}`;
    const imageUrl = `/uploads/${fileName}`;

    // TODO: Implement actual file upload to cloud storage
    // For development, you might want to save to local storage
    // For production, use services like AWS S3, Cloudinary, or similar

    return NextResponse.json({
      url: imageUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 