const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret 
});

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products'
    });
    // Delete file from local storage after upload
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    // Delete file from local storage if upload fails
    fs.unlinkSync(filePath);
    throw error;
  }
};

module.exports = {
  ...cloudinary,
  uploadToCloudinary
};