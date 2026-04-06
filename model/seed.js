const Clinic = require('./Clinic');
const User = require('./User');
const Reservation = require('./Reservation');
const { addDays, toISODate } = require('../utils/dates');
const { generateReferenceCode, isPasswordHash, hashPassword } = require('../utils/security');

async function seedClinics() {
  if (await Clinic.countDocuments() > 0) {
    return Clinic.find().sort({ name: 1 });
  }

  await Clinic.insertMany([
    { name: 'Makati Branch', location: 'Makati City', description: 'Flagship branch for consultations, vaccines, and routine checkups.' },
    { name: 'BGC Branch', location: 'Taguig City', description: 'Modern branch focused on grooming and preventive care.' },
    { name: 'QC Branch', location: 'Quezon City', description: 'High-capacity branch for family pets and weekday bookings.' },
    { name: 'Manila Branch', location: 'Manila City', description: 'Convenient city-center branch for quick consultations.' },
    { name: 'Pasig Branch', location: 'Pasig City', description: 'Branch with support for surgery follow-ups and emergency cases.' }
  ]);

  return Clinic.find().sort({ name: 1 });
}

async function seedUsers() {
  if (await User.countDocuments() > 0) {
    return User.find().sort({ name: 1 });
  }

  await User.insertMany([
    {
      name: 'Mia Santos',
      email: 'mia@vetstappen.com',
      password: 'password1',
      bio: 'Pet owner. Loves cats and preventive care.',
      avatarPath: '/images/client1.jpg',
      isStaff: false
    },
    {
      name: 'Carlo Reyes',
      email: 'carlo@vetstappen.com',
      password: 'password2',
      bio: 'Dog dad. Always on the lookout for grooming slots.',
      avatarPath: '/images/client2.jpg',
      isStaff: false
    },
    {
      name: 'Alyssa Cruz',
      email: 'alyssa@vetstappen.com',
      password: 'password3',
      bio: 'New pet owner. Interested in vaccination schedules.',
      avatarPath: '/images/client3.jpg',
      isStaff: false
    },
    {
      name: 'Noel Garcia',
      email: 'noel@vetstappen.com',
      password: 'password6',
      bio: 'Fosters rescue dogs and books regular follow-up visits.',
      avatarPath: '/images/client4.jpg',
      isStaff: false
    },
    {
      name: 'Bianca Flores',
      email: 'bianca@vetstappen.com',
      password: 'password7',
      bio: 'Keeps vaccine records and grooming schedules organized.',
      avatarPath: '/images/client5.jpg',
      isStaff: false
    },
    {
      name: 'Dr. Bea Lim',
      email: 'dr.bea@vetstappen.com',
      password: 'password4',
      bio: 'Clinic staff. Manages schedules and walk-in cases.',
      avatarPath: '/images/client4.jpg',
      isStaff: true
    },
    {
      name: 'Dr. Paolo Tan',
      email: 'dr.paolo@vetstappen.com',
      password: 'password5',
      bio: 'Clinic staff. Handles surgical appointment workflows.',
      avatarPath: '/images/client5.jpg',
      isStaff: true
    }
  ]);

  return User.find().sort({ name: 1 });
}

async function generateUniqueReferenceCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateReferenceCode();
    const exists = await Reservation.exists({ referenceCode: candidate });
    if (!exists) return candidate;
  }

  throw new Error('Unable to create a unique reservation reference code while seeding.');
}

async function seedReservations(clinics, users) {
  if (await Reservation.countDocuments() > 0) {
    return;
  }

  const clinicByName = Object.fromEntries(clinics.map((clinic) => [clinic.name, clinic]));
  const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));
  const today = new Date();

  await Reservation.insertMany([
    {
      userId: userByEmail['mia@vetstappen.com']._id,
      ownerName: 'Mia Santos',
      ownerEmail: 'mia@vetstappen.com',
      isAnonymous: false,
      clinicId: clinicByName['Makati Branch']._id,
      date: toISODate(addDays(today, 1)),
      time: '09:00 AM',
      service: 'Vaccination',
      status: 'Booked',
      isWalkIn: false
    },
    {
      userId: userByEmail['carlo@vetstappen.com']._id,
      ownerName: 'Carlo Reyes',
      ownerEmail: 'carlo@vetstappen.com',
      isAnonymous: false,
      clinicId: clinicByName['BGC Branch']._id,
      date: toISODate(addDays(today, 1)),
      time: '11:00 AM',
      service: 'Grooming',
      status: 'Booked',
      isWalkIn: false
    },
    {
      userId: userByEmail['alyssa@vetstappen.com']._id,
      ownerName: 'Alyssa Cruz',
      ownerEmail: 'alyssa@vetstappen.com',
      isAnonymous: false,
      clinicId: clinicByName['QC Branch']._id,
      date: toISODate(addDays(today, 2)),
      time: '03:00 PM',
      service: 'Consultation',
      status: 'Booked',
      isWalkIn: false
    },
    {
      userId: userByEmail['noel@vetstappen.com']._id,
      ownerName: 'Noel Garcia',
      ownerEmail: 'noel@vetstappen.com',
      isAnonymous: false,
      clinicId: clinicByName['Manila Branch']._id,
      date: toISODate(addDays(today, 3)),
      time: '03:00 PM',
      service: 'Vaccination',
      status: 'Booked',
      isWalkIn: false
    },
    {
      userId: userByEmail['bianca@vetstappen.com']._id,
      ownerName: 'Bianca Flores',
      ownerEmail: 'bianca@vetstappen.com',
      isAnonymous: false,
      clinicId: clinicByName['Pasig Branch']._id,
      date: toISODate(addDays(today, 4)),
      time: '03:00 PM',
      service: 'Grooming',
      status: 'Booked',
      isWalkIn: false
    },
    {
      userId: null,
      ownerName: 'Rico Mendoza',
      ownerEmail: 'rico.guest@example.com',
      isAnonymous: true,
      referenceCode: await generateUniqueReferenceCode(),
      clinicId: clinicByName['QC Branch']._id,
      date: toISODate(addDays(today, 2)),
      time: '01:00 PM',
      service: 'Emergency Care',
      status: 'Booked',
      isWalkIn: false
    },
    {
      userId: null,
      ownerName: 'Walk-in: Max (Dog)',
      ownerEmail: '',
      isAnonymous: false,
      clinicId: clinicByName['Pasig Branch']._id,
      date: toISODate(addDays(today, 2)),
      time: '04:00 PM',
      service: 'Vaccination',
      status: 'Booked',
      isWalkIn: true
    },
    {
      userId: userByEmail['mia@vetstappen.com']._id,
      ownerName: 'Mia Santos',
      ownerEmail: 'mia@vetstappen.com',
      isAnonymous: false,
      clinicId: clinicByName['Makati Branch']._id,
      date: toISODate(addDays(today, 5)),
      time: '04:00 PM',
      service: 'Emergency Care',
      status: 'No-show',
      isWalkIn: false
    }
  ]);
}

async function migrateUsers() {
  const users = await User.find();
  for (const user of users) {
    let changed = false;

    if (!isPasswordHash(user.password)) {
      user.password = hashPassword(user.password);
      changed = true;
    }

    if (!user.avatarPath) {
      user.avatarPath = '/uploads/default-avatar.png';
      changed = true;
    }

    if (changed) {
      await user.save();
    }
  }
}

async function migrateReservations() {
  const reservations = await Reservation.find();
  for (const reservation of reservations) {
    let changed = false;

    if (!reservation.ownerEmail && reservation.userId) {
      const user = await User.findById(reservation.userId).lean();
      if (user?.email) {
        reservation.ownerEmail = user.email;
        changed = true;
      }
    }

    if (reservation.isAnonymous && !reservation.referenceCode) {
      reservation.referenceCode = await generateUniqueReferenceCode();
      changed = true;
    }

    if (reservation.userId && reservation.isAnonymous) {
      reservation.userId = null;
      changed = true;
    }

    if (changed) {
      await reservation.save();
    }
  }
}

async function seedDatabase() {
  const clinics = await seedClinics();
  const users = await seedUsers();
  await seedReservations(clinics, users);
  await migrateUsers();
  await migrateReservations();
  console.log('[DB] Sample data ready.');
}

module.exports = { seedDatabase };
