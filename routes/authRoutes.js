const express = require('express');
const { renderLogin, login, renderRegister, register, logout } = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

const router = express.Router();

router.get('/login', requireGuest, renderLogin);
router.post('/login', requireGuest, login);
router.get('/register', requireGuest, renderRegister);
router.post('/register', requireGuest, register);
router.post('/logout', logout);

module.exports = router;
