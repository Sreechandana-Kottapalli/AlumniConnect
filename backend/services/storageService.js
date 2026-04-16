/**
 * Supabase Storage helpers – replaces cloudinaryService.js.
 * Handles resume PDF upload / deletion from the "resumes" bucket.
 */
const supabase = require("../config/supabase");

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "resumes";

// Module-level flag so we only check/create the bucket once per process
let _bucketReady = false;

/**
 * Ensures the storage bucket exists, creating it if necessary.
 * Called lazily before the first upload operation.
 */
const ensureBucket = async () => {
  if (_bucketReady) return;

  const { error: getError } = await supabase.storage.getBucket(BUCKET);

  if (getError) {
    const msg = (getError.message || "").toLowerCase();
    if (msg.includes("not found") || msg.includes("does not exist") || msg.includes("no bucket")) {
      console.log(`[Storage] Bucket "${BUCKET}" not found — creating it now.`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ["application/pdf"],
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB
      });
      if (createError) throw new Error(`Failed to create storage bucket "${BUCKET}": ${createError.message}`);
      console.log(`[Storage] Bucket "${BUCKET}" created successfully.`);
    } else {
      throw new Error(`Failed to access storage bucket "${BUCKET}": ${getError.message}`);
    }
  }

  _bucketReady = true;
};

/**
 * Upload a resume PDF buffer to Supabase Storage.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} userId  - Used to build a unique storage path
 * @returns {{ url: string, path: string }}
 */
const uploadResume = async (buffer, userId) => {
  await ensureBucket();

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

module.exports = { uploadResume, deleteResume, ensureBucket };
