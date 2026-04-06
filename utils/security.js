const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${derivedKey}`;
}

function isPasswordHash(value) {
  return /^scrypt:[a-f0-9]+:[a-f0-9]+$/i.test(String(value || ''));
}

function verifyPassword(password, storedHash) {
  if (!isPasswordHash(storedHash)) {
    return false;
  }

  const [, salt, storedDigest] = String(storedHash).split(':');
  const derivedBuffer = crypto.scryptSync(String(password), salt, Buffer.from(storedDigest, 'hex').length);
  const storedBuffer = Buffer.from(storedDigest, 'hex');
  return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function generateReferenceCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VS-';
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return code;
}

module.exports = {
  hashPassword,
  isPasswordHash,
  verifyPassword,
  generateSessionToken,
  hashToken,
  generateReferenceCode
};
