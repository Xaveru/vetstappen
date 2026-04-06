const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadsDir),
  filename: (req, file, callback) => {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40) || 'avatar';
    const extension = path.extname(file.originalname) || '.png';
    callback(null, `${safeBase}-${Date.now()}${extension}`);
  }
});

function imageOnlyFilter(req, file, callback) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error('Please upload a JPG, PNG, GIF, or WEBP image only.'));
  }

  return callback(null, true);
}

const avatarUpload = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

function handleAvatarUpload(req, res, next) {
  avatarUpload.single('avatar')(req, res, (error) => {
    if (!error) {
      return next();
    }

    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Avatar upload failed. Please use an image smaller than 2 MB.'
      : error.message;

    return res.redirect(`/profile?error=${encodeURIComponent(message)}`);
  });
}

module.exports = { handleAvatarUpload, allowedMimeTypes };
