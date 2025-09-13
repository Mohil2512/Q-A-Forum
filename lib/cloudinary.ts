import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };

export const uploadToCloudinary = async (
  file: File | Buffer,
  folder: string = 'qa-forum'
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_bytes: 2 * 1024 * 1024, // 2MB limit
      quality: 'auto:good',
      fetch_format: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
      ],
    };

    if (file instanceof File) {
      // Convert File to Buffer
      file.arrayBuffer()
        .then(buffer => {
          const bufferData = Buffer.from(buffer);
          cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else if (result) {
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  bytes: result.bytes,
                });
              }
            })
            .end(bufferData);
        })
        .catch(reject);
    } else {
      // File is already a Buffer
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          }
        })
        .end(file);
    }
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};
