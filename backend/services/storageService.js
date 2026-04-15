/**
 * Supabase Storage helpers – replaces cloudinaryService.js.
 * Handles resume PDF upload / deletion from the "resumes" bucket.
 */
const supabase = require("../config/supabase");

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "resumes";

/**
 * Upload a resume PDF buffer to Supabase Storage.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} userId  - Used to build a unique storage path
 * @returns {{ url: string, path: string }}
 */
const uploadResume = async (buffer, userId) => {
  const timestamp = Date.now();
  const path = `resume_${userId}_${timestamp}.pdf`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
};

/**
 * Delete a resume from Supabase Storage by its storage path.
 * @param {string} path - The path returned by uploadResume (e.g. "resume_<id>_<ts>.pdf")
 */
const deleteResume = async (path) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
};

module.exports = { uploadResume, deleteResume };
