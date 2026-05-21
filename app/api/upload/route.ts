import ImageKit from "imagekit";
import { NextResponse } from "next/server";

console.log('🔐 ImageKit Config Check:');
console.log('  ✓ NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:', !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
console.log('  ✓ IMAGEKIT_PRIVATE_KEY:', !!process.env.IMAGEKIT_PRIVATE_KEY);
console.log('  ✓ NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:', !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);

if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  console.error('❌ Missing ImageKit credentials in environment variables');
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  try {
    console.log('📤 Upload API called');
    
    const form = await req.formData();
    const file = form.get("file") as File;

    console.log('📥 Form data received');

    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log('📂 Original file details:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    
    let buffer = Buffer.from(await file.arrayBuffer());
    const originalSize = buffer.length;
    
    console.log('✓ File converted to buffer, size:', buffer.length);

    // Compress image using ImageKit's built-in compression
    // ImageKit will handle WebP conversion and optimization automatically
    console.log('🔌 Calling imagekit.upload()...');
    const result = await imagekit.upload({
      file: buffer,
      fileName: `miwani_${Date.now()}_${file.name}`,
      folder: '/miwani-mawlawi',
      useUniqueFileName: true,
      // ImageKit will optimize on upload automatically
      tags: ['menu', 'compressed'],
      isPrivateFile: false,
    });

    console.log('✅ Upload successful');
    console.log('  filePath:', result.filePath);
    console.log('  fileId:', result.fileId);
    console.log('  URL:', result.url);

    return NextResponse.json({
      success: true,
      filePath: result.filePath,
      fileId: result.fileId,
      url: result.url,
      originalSize,
      // Note: ImageKit will serve optimized WebP versions via URL parameters
      // Use the getAdminImageUrl(), getThumbnailUrl(), etc. functions for best compression
    });
  } catch (error) {
    console.error('❌ Upload API error:');
    console.error('  Error type:', typeof error);
    console.error('  Error:', error);
    
    if (error instanceof Error) {
      console.error('  Message:', error.message);
      console.error('  Stack:', error.stack);
    }
    
    // Convert error to string safely
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMsg = JSON.stringify(error);
    } else {
      errorMsg = String(error);
    }
    
    console.error('  Final error message:', errorMsg);

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
