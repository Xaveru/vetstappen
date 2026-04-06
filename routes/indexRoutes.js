const express = require('express');
const { renderHome, renderAbout, renderServices, renderContact, sendContact } = require('../controllers/pageController');

const router = express.Router();

router.get('/', renderHome);
router.get('/about', renderAbout);
router.get('/services', renderServices);
router.get('/contact', renderContact);
router.post('/contact', sendContact);

module.exports = router;
