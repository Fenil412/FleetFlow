import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Upload a buffer directly to Cloudinary
 * @param {Buffer} buffer — image buffer from multer memory storage
 * @param {string} folder — cloudinary folder (e.g. 'fleetflow/avatars')
 * @param {string} publicId — optional custom public_id
 * @returns {Promise<string>} — secure URL of the uploaded image
 */
export const uploadBuffer = (buffer, folder = 'fleetflow/avatars', publicId) => {
    return new Promise((resolve, reject) => {
        const opts = {
            folder,
            resource_type: 'image',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        };
        if (publicId) opts.public_id = publicId;

        const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
};

export default cloudinary;
