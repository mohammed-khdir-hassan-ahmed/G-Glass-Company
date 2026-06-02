import ImageKit from 'imagekit';

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

let imagekit: ImageKit | null = null;

if (publicKey && privateKey && urlEndpoint) {
  imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
} else {
  console.warn('⚠️ ImageKit credentials are missing in server environment variables.');
}

/**
 * Deletes an image from ImageKit using its file path or URL
 * @param imagePath - e.g., "/miwani-mawlawi/miwani_1234_image.jpg" or full URL
 * @returns Promise<boolean> indicating success
 */
export async function deleteImageFromImageKit(imagePath: string): Promise<boolean> {
  if (!imagekit) {
    console.error('❌ Cannot delete image: ImageKit is not initialized');
    return false;
  }

  if (!imagePath) {
    console.warn('⚠️ deleteImageFromImageKit called with empty imagePath');
    return false;
  }

  try {
    // 1. Extract the path component if it's a full URL
    let path = imagePath;
    if (imagePath.includes('http://') || imagePath.includes('https://')) {
      try {
        const url = new URL(imagePath);
        path = url.pathname;
      } catch (err) {
        console.error('❌ Failed to parse image URL:', err);
      }
    }

    // 2. Extract filename (last segment of the path)
    const filename = path.split('/').pop();
    if (!filename) {
      console.warn(`⚠️ Could not extract filename from path: ${imagePath}`);
      return false;
    }

    console.log(`🔍 Searching ImageKit for file name: "${filename}"`);

    // 3. Search for the file in ImageKit to retrieve its fileId
    const files = await imagekit.listFiles({
      searchQuery: `name = "${filename}"`,
    });

    const file = files[0];
    if (!file || !('fileId' in file)) {
      console.warn(`⚠️ File not found or not a valid file object in ImageKit for name: "${filename}"`);
      return false;
    }

    const fileId = file.fileId;
    console.log(`🗑️ Deleting file from ImageKit. fileId: ${fileId}, name: ${filename}`);

    // 4. Delete the file by fileId
    await imagekit.deleteFile(fileId);
    console.log(`✅ Successfully deleted file from ImageKit: "${filename}"`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file from ImageKit:', error);
    return false;
  }
}
