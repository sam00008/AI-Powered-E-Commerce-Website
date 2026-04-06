// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECERET
    });
    try {
        if (!filePath) return null;
        
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        
        return uploadResult.secure_url; // Returns the string URL

    } catch (error) {
        // Only attempt to delete if the file actually exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.log("Cloudinary Upload Error:", error);
        return null;
    }
}

export default uploadOnCloudinary;