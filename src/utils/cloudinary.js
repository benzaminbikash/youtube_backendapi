const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDING_CLOUD_NAME,
  api_key: process.env.CLOUDING_API_KEY,
  api_secret: process.env.CLOUDING_API_SECRET,
});

const uploadOnCloudinary = async (uploadFile) => {
  try {
    if (!uploadFile) return null;
    const response = await cloudinary.uploader.upload(uploadFile, {
      resource_type: "auto",
    });
    fs.unlinkSync(uploadFile);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(uploadFile);
    return null;
  }
};

module.exports = uploadOnCloudinary;
