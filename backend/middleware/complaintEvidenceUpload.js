const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_EVIDENCE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_EVIDENCE_IMAGE_COUNT = 4;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const uploadDirectory = path.join(__dirname, '..', 'uploads', 'complaint-evidence');

const ensureUploadDirectory = () => {
  fs.mkdirSync(uploadDirectory, { recursive: true });
};

const removeUploadedFiles = async (files = []) => {
  const uploadPaths = files.map((file) => file?.path).filter(Boolean);
  await Promise.all(uploadPaths.map((filePath) => fs.promises.unlink(filePath).catch(() => {})));
};

const storage = multer.diskStorage({
  destination(req, file, callback) {
    ensureUploadDirectory();
    callback(null, uploadDirectory);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = extension || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `evidence-${uniqueSuffix}${safeExtension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error('Only JPG, PNG, WEBP, or GIF images are allowed.'));
};

const complaintEvidenceUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_EVIDENCE_IMAGE_SIZE,
    files: MAX_EVIDENCE_IMAGE_COUNT,
  },
});

const uploadComplaintEvidenceImages = (req, res, next) =>
  complaintEvidenceUpload.array('evidenceImages', MAX_EVIDENCE_IMAGE_COUNT)(req, res, async (error) => {
    if (!error) {
      next();
      return;
    }

    await removeUploadedFiles(Array.isArray(req.files) ? req.files : []);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, message: `Each image must be ${MAX_EVIDENCE_IMAGE_SIZE / (1024 * 1024)}MB or smaller.` });
        return;
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({ success: false, message: `You can upload up to ${MAX_EVIDENCE_IMAGE_COUNT} evidence images.` });
        return;
      }
    }

    res.status(400).json({ success: false, message: error.message || 'Failed to upload evidence images.' });
  });

module.exports = {
  uploadComplaintEvidenceImages,
  MAX_EVIDENCE_IMAGE_COUNT,
  MAX_EVIDENCE_IMAGE_SIZE,
};
