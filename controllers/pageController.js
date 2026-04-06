const { normalizeEmail, normalizeText, isValidEmail } = require('../utils/validation');

function renderHome(req, res) {
  return res.render('index', { title: 'VetStappen' });
}

function renderAbout(req, res) {
  return res.render('about', { title: 'VetStappen | About Us' });
}

function renderServices(req, res) {
  return res.render('services', { title: 'VetStappen | Services' });
}

function renderContact(req, res) {
  return res.render('contact', { title: 'VetStappen | Contact Us' });
}

function sendContact(req, res) {
  const name = normalizeText(req.body.name);
  const email = normalizeEmail(req.body.email);
  const message = normalizeText(req.body.message);

  if (!name || !isValidEmail(email) || message.length < 10) {
    return res.redirect(`/contact?error=${encodeURIComponent('Please provide your name, a valid email, and a message with at least 10 characters.')}`);
  }

  return res.redirect(`/contact?success=${encodeURIComponent('Thank you for your message! We will get back to you through the email you provided.')}`);
}

module.exports = {
  renderHome,
  renderAbout,
  renderServices,
  renderContact,
  sendContact
};
