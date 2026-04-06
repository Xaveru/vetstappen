require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');
const { connectDB, closeDB } = require('./model/db');
const { seedDatabase } = require('./model/seed');
const { attachCurrentUser } = require('./middleware/auth');
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const hbsHelpers = {
  eq: (a, b) => String(a ?? '') === String(b ?? ''),
  selected: (a, b) => (String(a ?? '') === String(b ?? '') ? 'selected' : ''),
  checked: (value) => (value ? 'checked' : ''),
  activeAttr: (pathValue, expected) => (String(pathValue || '') === String(expected || '') ? 'aria-current="page"' : ''),
  notCancelled: (status) => String(status || '') !== 'Cancelled',
  statusBadgeClass: (status) => `status-badge status-${String(status || '').toLowerCase().replace(/[^a-z]+/g, '-')}`
};

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: hbsHelpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.messages = {
    success: String(req.query.success || ''),
    error: String(req.query.error || ''),
    info: String(req.query.info || '')
  };
  next();
});

app.use(attachCurrentUser);

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', appointmentRoutes);
app.use('/', reservationRoutes);
app.use('/', profileRoutes);
app.use('/', staffRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((error, req, res, next) => {
  console.error('[SERVER ERROR]', error);
  res.status(500).render('500', {
    title: 'Server Error',
    errorMessage: error && error.message ? error.message : 'Unknown error'
  });
});

async function startServer() {
  await connectDB();
  await seedDatabase();

  const server = app.listen(PORT, () => {
    console.log(`VetStappen running at http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Close the other app using localhost:${PORT} and try again.`);
      process.exit(1);
    }

    console.error('Unexpected server error:', error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});

async function handleShutdown() {
  await closeDB();
  process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
