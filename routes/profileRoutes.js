const express = require('express');
const { renderProfile, updateProfile, renderDeleteAccount, deleteAccount } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');
const { handleAvatarUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/profile', requireAuth, renderProfile);
router.post('/profile', requireAuth, handleAvatarUpload, updateProfile);
router.get('/delete-account', requireAuth, renderDeleteAccount);
router.post('/delete-account', requireAuth, deleteAccount);

module.exports = router;
