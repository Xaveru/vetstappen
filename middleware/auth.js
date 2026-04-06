const Session = require('../model/Session');
const User = require('../model/User');
const { generateSessionToken, hashToken } = require('../utils/security');
const { SESSION_TTL_MS } = require('../utils/constants');

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };
}

async function createSession(res, req, user) {
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);

  await Session.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    userAgent: String(req.get('user-agent') || '').slice(0, 250),
    ipAddress: String(req.ip || '')
  });

  res.cookie('sessionToken', rawToken, getSessionCookieOptions());
}

async function destroySession(req, res) {
  const sessionToken = String(req.cookies.sessionToken || '');
  if (sessionToken) {
    await Session.deleteOne({ tokenHash: hashToken(sessionToken) });
  }

  res.clearCookie('sessionToken', getSessionCookieOptions());
}

async function attachCurrentUser(req, res, next) {
  req.currentUser = null;
  req.currentSession = null;
  res.locals.currentUser = null;

  const sessionToken = String(req.cookies.sessionToken || '');
  if (!sessionToken) {
    return next();
  }

  try {
    const session = await Session.findOne({ tokenHash: hashToken(sessionToken) }).lean();
    if (!session || new Date(session.expiresAt) <= new Date()) {
      if (session) {
        await Session.deleteOne({ _id: session._id });
      }
      res.clearCookie('sessionToken', getSessionCookieOptions());
      return next();
    }

    const user = await User.findById(session.userId).lean();
    if (!user) {
      await Session.deleteOne({ _id: session._id });
      res.clearCookie('sessionToken', getSessionCookieOptions());
      return next();
    }

    req.currentUser = user;
    req.currentSession = session;
    res.locals.currentUser = user;
    return next();
  } catch (error) {
    res.clearCookie('sessionToken', getSessionCookieOptions());
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return res.redirect(`/login?error=${encodeURIComponent('Please login first.')}`);
  }
  return next();
}

function requireGuest(req, res, next) {
  if (req.currentUser) {
    return res.redirect(`/profile?info=${encodeURIComponent('You are already logged in.')}`);
  }
  return next();
}

function requireStaff(req, res, next) {
  if (!req.currentUser || !req.currentUser.isStaff) {
    return res.redirect(`/staff?error=${encodeURIComponent('Staff access is required for that action.')}`);
  }
  return next();
}

module.exports = {
  attachCurrentUser,
  requireAuth,
  requireGuest,
  requireStaff,
  createSession,
  destroySession,
  getSessionCookieOptions
};
