# VetStappen - Phase 3 Final Project Build

VetStappen is a veterinary appointment reservation system built for CCAPDEV. This Phase 3 build focuses on a usable, stable foundation rather than flashy UI. The application supports account-linked reservations, anonymous reservations with reference-code lookup, staff walk-ins, reservation management, profile editing, account deletion, and database-backed views rendered through Handlebars.

The project follows a Model-View-Controller structure and uses Node.js, Express, MongoDB, and Mongoose.

## What changed in this Phase 3 build

Compared with the earlier Phase 2 version, this build now includes:

- server-side session authentication
- hashed passwords using Node.js `crypto`
- anonymous booking flow with reference code plus email lookup
- front-end and back-end validation for major forms
- stricter reservation editing and cancellation rules
- account deletion that fully removes the user and cancels linked reservations
- improved staff dashboard flow
- About page package/library listing
- more detailed setup and deployment documentation

## Core feature set

### Public features

- Home page
- Services page
- About page
- Contact page
- View appointment availability for the next 7 days
- Search appointment slots by clinic, date, time, and service
- Anonymous booking
- Anonymous reservation lookup using email + reference code
- Register
- Login

### Logged-in user features

- Book account-linked reservations
- View reservations tied to the logged-in account
- Edit booked reservations
- Cancel booked reservations
- View and edit profile
- Upload avatar
- Delete account

### Staff features

- View all reservations
- Add walk-in reservations
- Mark reservations as no-show
- Cancel reservations

## Project structure

```text
app.js
package.json
package-lock.json
README.md
.env
.env.example
controllers/
  appointmentController.js
  authController.js
  pageController.js
  profileController.js
  reservationController.js
  staffController.js
middleware/
  auth.js
  upload.js
model/
  Clinic.js
  Reservation.js
  Session.js
  User.js
  db.js
  seed.js
routes/
  appointmentRoutes.js
  authRoutes.js
  indexRoutes.js
  profileRoutes.js
  reservationRoutes.js
  staffRoutes.js
utils/
  appointments.js
  constants.js
  dates.js
  security.js
  validation.js
views/
  layouts/main.hbs
  partials/
    footer.hbs
    head.hbs
    header.hbs
    messages.hbs
  404.hbs
  500.hbs
  about.hbs
  appointments.hbs
  contact.hbs
  delete-account.hbs
  index.hbs
  login.hbs
  profile.hbs
  register.hbs
  reservations.hbs
  services.hbs
  staff.hbs
public/
  images/
  uploads/
  script.js
  styles.css
```

## Technologies, packages, and libraries used

### Main stack

- Node.js
- Express
- Express Handlebars
- MongoDB
- Mongoose
- Vanilla JavaScript
- HTML/CSS

### NPM packages actually used

- `express` - web server and routing
- `express-handlebars` - server-side template engine
- `mongoose` - ODM for MongoDB
- `dotenv` - environment variable loading
- `cookie-parser` - reads cookies used for server-side session restoration
- `multer` - avatar image upload handling
- `mongodb-memory-server` - optional temporary fallback database for demo use only
- `nodemon` - development-only restart helper

### Built-in Node.js modules used

- `crypto` - password hashing, session token hashing, anonymous reservation reference generation
- `fs` - uploaded avatar file cleanup
- `path` - file path handling

## Authentication and session design

This build no longer uses the original Phase 2 cookie-only login shortcut.

It now uses a server-side session pattern:

1. The user logs in with email and password.
2. The password is verified against a hashed value stored in MongoDB.
3. A random session token is created.
4. Only the token hash is stored in MongoDB.
5. The raw token is stored in an HTTP-only browser cookie.
6. On later requests, the cookie token is hashed and matched against the session record.
7. Logout deletes the session record and clears the cookie.

This satisfies the Phase 3 requirement that the login state persists until logout or browser close. The cookie is a browser-session cookie, so it normally ends when the browser session ends.

## Password hashing design

Passwords are hashed before storage using the built-in Node.js `crypto.scryptSync()` function.

Stored format:

```text
scrypt:<salt>:<digest>
```

During login, the submitted password is hashed again with the stored salt and compared using a timing-safe equality check.

## Reservation design

### Account-linked reservation

- Requires login
- Reservation is tied to `userId`
- Appears in the logged-in user’s reservation list
- Can be edited or cancelled by the owner
- Staff can also manage it

### Anonymous reservation

- Does not require login
- Does not store `userId`
- Stores owner name, owner email, and generated reference code
- Can later be managed through the Reservations page using:
  - the same email used during booking
  - the generated reservation reference code

### Walk-in reservation

- Created by staff only
- Not linked to an account
- Managed through the staff dashboard

## Data model summary

### User

Fields include:

- `name`
- `email`
- `password` (hashed)
- `bio`
- `avatarPath`
- `isStaff`

### Reservation

Fields include:

- `userId` (nullable)
- `ownerName`
- `ownerEmail`
- `isAnonymous`
- `referenceCode` (for anonymous reservations)
- `clinicId`
- `date`
- `time`
- `service`
- `status`
- `isWalkIn`

### Session

Fields include:

- `userId`
- `tokenHash`
- `expiresAt`
- `userAgent`
- `ipAddress`

### Clinic

Fields include:

- `name`
- `location`
- `description`

## Sample data included

The seed script creates at least 5 realistic records for applicable features.

Included sample data:

- 5 clinics
- 7 users
- 8 reservations

Reservation samples include:

- normal booked reservations
- anonymous reservation
- walk-in reservation
- no-show reservation

## Sample login accounts

These accounts are inserted by the seed script on first run:

| Type | Email | Password |
|---|---|---|
| User | mia@vetstappen.com | password1 |
| User | carlo@vetstappen.com | password2 |
| User | alyssa@vetstappen.com | password3 |
| Staff | dr.bea@vetstappen.com | password4 |
| Staff | dr.paolo@vetstappen.com | password5 |

## Database setup options

You need a MongoDB database to run the application reliably.

### Recommended option: local MongoDB

Use a local MongoDB instance and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/vetstappen_phase3
```

### Recommended option: MongoDB Atlas

Create a MongoDB Atlas cluster and set your connection string in `.env`.

Example structure:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/vetstappen_phase3?retryWrites=true&w=majority
```

### Optional fallback: mongodb-memory-server

This project still supports the temporary in-memory fallback used in the earlier project, but it is now **opt-in**.

To use it:

```env
USE_IN_MEMORY_DB=true
```

Important note:

`mongodb-memory-server` may try to download a MongoDB binary the first time it runs. That means it needs internet access. For a stable class demo, use local MongoDB or Atlas instead.

## Installation and local run instructions

### 1. Open the project folder

```bash
cd VetStappen-Phase3
```

### 2. Install dependencies

If `node_modules` is not already included in your copy:

```bash
npm install
```

### 3. Configure the environment file

Create or edit `.env`.

Recommended local example:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/vetstappen_phase3
USE_IN_MEMORY_DB=false
```

### 4. Start the app

```bash
npm start
```

### 5. Open the browser

```text
http://localhost:3000
```

## Development mode

For auto-restart while editing:

```bash
npm run dev
```

## Seeder behavior

The app automatically runs `seedDatabase()` during startup.

That means:

- sample clinics are inserted if missing
- sample users are inserted if missing
- sample reservations are inserted if missing
- older plaintext passwords from a previous database are upgraded to hashed values
- older anonymous reservations are upgraded with reference codes if needed

You can also run the seed logic manually:

```bash
npm run seed
```

## Form validation implemented

### Front-end validation

Implemented through HTML input constraints and small JavaScript checks.

Examples:

- required fields
- email input types
- password minimum length and pattern
- confirm-password match
- contact message minimum length
- avatar type and file-size checks
- delete-account confirmation text

### Back-end validation

Implemented in controllers before database writes.

Examples:

- valid login credentials
- unique registration email
- password strength enforcement
- booking mode rules
- anonymous booking email requirement
- valid time/service/date checks
- valid walk-in input
- valid profile input length
- duplicate slot conflict checks
- anonymous reservation edit/cancel verification using email + reference code

## Main route list

### GET routes

- `/`
- `/about`
- `/services`
- `/contact`
- `/login`
- `/register`
- `/appointments`
- `/reservations`
- `/profile`
- `/staff`
- `/delete-account`

### POST routes

- `/contact`
- `/login`
- `/register`
- `/logout`
- `/appointments/book`
- `/reservations/:id/edit`
- `/reservations/:id/cancel`
- `/guest-reservations/:id/edit`
- `/guest-reservations/:id/cancel`
- `/profile`
- `/staff/walkin`
- `/staff/reservations/:id/noshow`
- `/staff/reservations/:id/cancel`
- `/delete-account`

## Permission rules

### Public

- browse the public pages
- search appointment slots
- create anonymous bookings
- look up anonymous bookings with email + reference code

### Logged-in user

- manage only reservations tied to their account
- edit their own profile
- delete their own account

### Staff

- access the staff dashboard
- view all reservations
- create walk-ins
- cancel reservations
- mark no-show reservations

## Account deletion behavior

When a user deletes their account:

- the user document is permanently removed
- linked booked reservations are marked as cancelled
- the user reference is removed from those reservations
- active sessions for that user are deleted
- uploaded custom avatar files are removed from `public/uploads` when applicable

## Avatar upload notes

Avatar uploads use local file storage under:

```text
public/uploads/
```

This is enough for local class demos. For long-term production hosting, a cloud image storage provider would be more reliable.

## Deployment recommendation

The easiest student-friendly deployment path is:

- **Render** for the Node.js app
- **MongoDB Atlas** for the database

### Suggested deployment steps

1. Push the project to GitHub.
2. Create a MongoDB Atlas cluster.
3. Create a Render web service linked to the GitHub repo.
4. Add environment variables on Render:
   - `PORT`
   - `MONGODB_URI`
   - `USE_IN_MEMORY_DB=false`
5. Deploy.
6. Test login, booking, anonymous lookup, profile, and staff actions on the live URL.

## Live Demo
https://vetstappen.onrender.com

## Known limitations

- Avatar uploads are stored locally, so they are less durable on some hosting platforms.
- Slot availability is generated from a fixed schedule pattern instead of a fully editable admin schedule builder.
- Contact messages are validated but not stored in the database because the main project scope focuses on reservation management.

## Recommended final submission checklist

Before submitting, confirm all of these on your own machine or hosted version:

- registration works
- login works
- logout works
- sessions persist across page changes
- hashed passwords are stored in the database
- account-linked bookings appear in My Reservations
- anonymous bookings generate a reference code
- anonymous bookings can be found again using email + reference code
- anonymous bookings can be edited and cancelled with valid credentials
- double booking is blocked
- staff login can access the staff dashboard
- walk-ins can be created
- no-show works
- cancel works
- profile editing works
- avatar upload works
- account deletion works
- About page lists packages and libraries
- README is included in the repository

## Notes for the instructor / defense

This Phase 3 version prioritizes correctness and usability over visual complexity. The UI is intentionally straightforward so the underlying application logic is easier to demonstrate:

- session-based authentication
- password hashing
- database-backed CRUD flows
- anonymous reservation management without account linkage
- route protection and role checks
- validation on both client and server sides

