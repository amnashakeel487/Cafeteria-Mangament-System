const multer = require('multer');
const path = require('path');
const supabase = require('./database');

const BUCKET = 'cafeteria_uploads';

// Use memory storage — files stay in RAM buffer, never written to disk
const storage = multer.memoryStorage();

function createUpload(fieldName, maxSizeMB = 5) {
    return multer({
        storage,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const allowedExts = /\.(jpeg|jpg|png|webp|mp4|webm|ogg|mov|avi|mkv)$/;
            const allowedMime = /^(image|video)\//;
            if (allowedExts.test(ext) || allowedMime.test(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only image/video files are allowed'));
            }
        }
    });
}

/**
 * Upload a file buffer to Supabase Storage and return its public URL.
 * @param {Buffer} buffer - The file buffer from multer memoryStorage
 * @param {string} folder - Subfolder inside the bucket (e.g. 'uploads', 'avatars', 'screenshots')
 * @param {string} originalName - Original filename for extension extraction
 * @returns {Promise<string>} The public URL of the uploaded file
 */
async function uploadToSupabase(buffer, folder, originalName, mimetype) {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

    const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.mkv': 'video/x-matroska',
    };
    const contentType = mimeMap[ext] || mimetype || 'application/octet-stream';

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(uniqueName, buffer, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error('Full Supabase Storage upload error:', error);
        throw new Error(`Storage upload failed: ${error.message} (Bucket: ${BUCKET})`);
    }

    const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(uniqueName);

    return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL.
 * Safe to call with null/undefined or non-Supabase URLs.
 * @param {string|null} publicUrl
 */
async function deleteFromSupabase(publicUrl) {
    if (!publicUrl || !publicUrl.includes(BUCKET)) return;

    try {
        // Extract path after bucket name: .../cafeteria_uploads/uploads/123-456.jpg -> uploads/123-456.jpg
        const parts = publicUrl.split(`${BUCKET}/`);
        if (parts.length < 2) return;

        const filePath = parts[1];
        await supabase.storage.from(BUCKET).remove([filePath]);
    } catch (err) {
        console.error('Failed to delete file from storage:', err.message);
    }
}

module.exports = { createUpload, uploadToSupabase, deleteFromSupabase, BUCKET };
