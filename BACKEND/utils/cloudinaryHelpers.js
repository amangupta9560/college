import cloudinary from '../config/cloudinary.js';

export const uploadBuffer = (fileBuffer, folder = 'hackmatch_avatars') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: 'image',
        transformation: folder === 'hackmatch_avatars' ? [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { fetch_format: 'webp', quality: 'auto:best' }
        ] : [
          { fetch_format: 'webp', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  // Slice after 'upload/vXXXXXXXX/'
  const fileParts = parts.slice(uploadIndex + 2);
  const fileWithExtension = fileParts.join('/');
  const dotIndex = fileWithExtension.lastIndexOf('.');
  return dotIndex === -1 ? fileWithExtension : fileWithExtension.substring(0, dotIndex);
};

export const deleteAsset = (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return Promise.resolve(null);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};
