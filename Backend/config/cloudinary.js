import { v2 as cloudinary } from 'cloudinary';

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECERET
    });
    try {
        if (!filePath) {
            return null;
        }
        const uploadResult = await cloudinary.uploader.upload
            (filePath)
        return uploadResult.secure_url

    } catch (error) {
        fs.unlinkSync(filePath)
        console.log(error);
    }

}

export default uploadOnCloudinary;