const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const uploadDirectory = path.join(__dirname, '..', 'uploads', 'complaint-chat');

const ensureUploadDirectory = () => {
  fs.mkdirSync(uploadDirectory, { recursive: true });
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
    callback(null, `chat-${uniqueSuffix}${safeExtension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error('Only JPG, PNG, WEBP, or GIF images are allowed.'));
};

const complaintChatUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_CHAT_IMAGE_SIZE,
    files: 1,
  },
});

const uploadComplaintChatImage = (req, res, next) =>
  complaintChatUpload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: `Image must be ${MAX_CHAT_IMAGE_SIZE / (1024 * 1024)}MB or smaller.` });
      return;
    }

    res.status(400).json({ success: false, message: error.message || 'Failed to upload chat image.' });
  });

module.exports = { uploadComplaintChatImage, MAX_CHAT_IMAGE_SIZE };
