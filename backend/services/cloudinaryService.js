const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId - The Cloudinary public_id to delete
 * @param {string} [resourceType="raw"] - "raw" for PDFs, "image" for images
 */
const deleteFile = async (publicId, resourceType = "raw") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
    throw err;
  }
};

module.exports = cloudinary;
module.exports.deleteFile = deleteFile;
