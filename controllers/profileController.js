const fs = require('fs');
const path = require('path');
const User = require('../model/User');
const Session = require('../model/Session');
const Reservation = require('../model/Reservation');
const { BIO_MAX_LENGTH } = require('../utils/constants');
const { normalizeText } = require('../utils/validation');
const { destroySession } = require('../middleware/auth');

const PLACEHOLDER_AVATAR = '/uploads/default-avatar.png';

function isCustomAvatar(avatarPath) {
  return Boolean(avatarPath && avatarPath.startsWith('/uploads/') && !avatarPath.endsWith('default-avatar.png'));
}

function removeAvatarIfNeeded(avatarPath) {
  if (!isCustomAvatar(avatarPath)) {
    return;
  }

  const relativeAvatarPath = avatarPath.replace(/^\//, '');
  const absolutePath = path.join(__dirname, '..', 'public', relativeAvatarPath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

async function renderProfile(req, res, next) {
  try {
    const profileUser = await User.findById(req.currentUser._id).lean();
    const publicUsers = await User.find({ _id: { $ne: req.currentUser._id } }).sort({ name: 1 }).limit(5).lean();

    const mappedUsers = publicUsers.map((user) => ({
      ...user,
      avatarSrc: user.avatarPath || PLACEHOLDER_AVATAR,
      roleLabel: user.isStaff ? 'Staff' : 'Pet Owner'
    }));

    return res.render('profile', {
      title: 'VetStappen | User Profile',
      profileUser: {
        ...profileUser,
        avatarSrc: profileUser.avatarPath || PLACEHOLDER_AVATAR
      },
      publicUsers: mappedUsers,
      bioMaxLength: BIO_MAX_LENGTH
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.currentUser._id);
    if (!user) {
      return res.redirect(`/login?error=${encodeURIComponent('Your account could not be found. Please login again.')}`);
    }

    const name = normalizeText(req.body.name);
    const bio = normalizeText(req.body.bio);

    if (!name) {
      return res.redirect(`/profile?error=${encodeURIComponent('Please enter your full name before saving.')}`);
    }

    if (bio.length > BIO_MAX_LENGTH) {
      return res.redirect(`/profile?error=${encodeURIComponent(`Bio must be ${BIO_MAX_LENGTH} characters or fewer.`)}`);
    }

    user.name = name;
    user.bio = bio;

    if (req.file) {
      removeAvatarIfNeeded(user.avatarPath);
      user.avatarPath = `/uploads/${req.file.filename}`;
    }

    await user.save();
    await Reservation.updateMany({ userId: user._id }, { $set: { ownerName: user.name, ownerEmail: user.email } });

    return res.redirect(`/profile?success=${encodeURIComponent('Profile saved successfully!')}`);
  } catch (error) {
    return next(error);
  }
}

function renderDeleteAccount(req, res) {
  return res.render('delete-account', {
    title: 'VetStappen | Delete Account',
    user: req.currentUser,
    hint: 'Deleting your account will cancel your linked reservations and permanently remove your profile.'
  });
}

async function deleteAccount(req, res, next) {
  try {
    const confirmation = normalizeText(req.body.confirmDelete);
    if (confirmation !== 'DELETE') {
      return res.redirect(`/delete-account?error=${encodeURIComponent('Type DELETE to confirm account removal.')}`);
    }

    const user = await User.findById(req.currentUser._id);
    if (!user) {
      return res.redirect(`/login?error=${encodeURIComponent('Your account could not be found. Please login again.')}`);
    }

    await Reservation.updateMany(
      { userId: user._id, status: 'Booked' },
      { $set: { status: 'Cancelled', userId: null } }
    );

    removeAvatarIfNeeded(user.avatarPath);
    await Session.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);
    await destroySession(req, res);
    return res.redirect(`/?success=${encodeURIComponent('Account deleted successfully. Your linked reservations were cancelled.')}`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderProfile,
  updateProfile,
  renderDeleteAccount,
  deleteAccount,
  PLACEHOLDER_AVATAR
};
