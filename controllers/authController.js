const User = require('../model/User');
const { createSession, destroySession } = require('../middleware/auth');
const { normalizeEmail, normalizeText, isValidEmail, validatePasswordStrength } = require('../utils/validation');
const { verifyPassword } = require('../utils/security');

function renderLogin(req, res) {
  return res.render('login', { title: 'VetStappen | Login' });
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!isValidEmail(email) || !password) {
      return res.redirect(`/login?error=${encodeURIComponent('Please enter a valid email and password.')}`);
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.password)) {
      return res.redirect(`/login?error=${encodeURIComponent('Invalid email or password.')}`);
    }

    await createSession(res, req, user);
    return res.redirect(`/profile?success=${encodeURIComponent('Login successful!')}`);
  } catch (error) {
    return next(error);
  }
}

function renderRegister(req, res) {
  return res.render('register', { title: 'VetStappen | Register' });
}

async function register(req, res, next) {
  try {
    const name = normalizeText(req.body.fullname);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const confirm = String(req.body.confirm || '');

    if (!name || !isValidEmail(email) || !password || !confirm) {
      return res.redirect(`/register?error=${encodeURIComponent('Please complete all required fields with valid values.')}`);
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.redirect(`/register?error=${encodeURIComponent(passwordError)}`);
    }

    if (password !== confirm) {
      return res.redirect(`/register?error=${encodeURIComponent('Passwords do not match. Please try again.')}`);
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.redirect(`/register?error=${encodeURIComponent('That email is already registered.')}`);
    }

    const newUser = await User.create({
      name,
      email,
      password,
      bio: '',
      avatarPath: '/uploads/default-avatar.png',
      isStaff: false
    });

    await createSession(res, req, newUser);
    return res.redirect(`/profile?success=${encodeURIComponent('Registration successful!')}`);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    await destroySession(req, res);
    return res.redirect('/');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderLogin,
  login,
  renderRegister,
  register,
  logout
};
