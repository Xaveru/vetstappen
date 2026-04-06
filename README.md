# VetStappen
`CCAPDEV - MCO3 - Group 9`
`- Flores, John Alec E.`
`- Ramos, Xavier S.`

VetStappen is a veterinary appointment reservation website developed for CCAPDEV. The system helps pet owners check appointment availability, reserve veterinary services, manage their bookings, and update their profile online. It also includes a staff side for handling walk-in clients and managing reservations.

The website was built using Node.js, Express, MongoDB, Mongoose, and Handlebars, following a Model-View-Controller structure. Its main goal is to provide a simple and functional reservation system that is easy to use and easy to demonstrate.

## What the website does

VetStappen allows users to:

- view available appointment slots for the next 7 days
- search slots by clinic, date, time, and service
- register and log in
- book appointments under their account
- create anonymous reservations without linking them to an account
- look up anonymous reservations using email and reference code
- view, edit, and cancel reservations
- update their profile and upload an avatar
- delete their account

For staff users, the website also allows:

- viewing all reservations
- creating walk-in reservations
- marking reservations as no-show
- cancelling reservations

## Main pages of the website

### Home
The home page introduces the website and gives users access to the main sections of the system.

### Services
This page shows the veterinary services offered, such as check-ups, grooming, vaccinations, and other common services.

### Appointments
This is where users can browse available appointment slots and book reservations. Users can filter by clinic, date, time, and service.

### Reservations
This page is used to manage reservations. Logged-in users can view their own reservations here. Anonymous users can also use this page to look up their reservation using their email and reference code.

### Profile
Logged-in users can view and edit their account details here, including their bio and avatar.

### Staff
This page is only for staff users. It allows them to manage reservations and add walk-in bookings.

### About
The About page explains the purpose of the project, the developers, and the technologies used in the system.

### Contact
This page provides a contact form for users who want to send a message through the website.

## How to navigate the website

### For regular users

1. Open the home page.
2. Register for a new account or log in using an existing account.
3. Go to the **Appointments** page.
4. Choose a clinic and check available schedules.
5. Book a reservation.
6. Open the **Reservations** page to review, edit, or cancel your booking.
7. Use the **Profile** page to update your account information if needed.

### For anonymous users

1. Open the **Appointments** page.
2. Choose an available slot.
3. Book the reservation as an anonymous user by entering the required details.
4. Save the generated reference code.
5. Go to the **Reservations** page later if you want to retrieve, edit, or cancel the anonymous reservation.
6. Enter the same email used during booking and the reservation reference code.

### For staff users

1. Log in using a staff account.
2. Open the **Staff** page.
3. View all reservations in the system.
4. Add walk-in bookings when needed.
5. Mark reservations as no-show or cancel them if necessary.

## User types in the system

### 1. Regular user
A regular user can create an account, log in, make reservations, manage their own bookings, and edit their profile.

### 2. Anonymous user
An anonymous user can book without logging in. Their reservation is not linked to a user account, so they need their email and reference code to manage it later.

### 3. Staff user
A staff user has additional access to staff tools such as walk-in creation and reservation management.

## Reservation types

### Account-linked reservation
This reservation is tied to a logged-in user account. It appears in the user’s reservation list and can be managed by the owner.

### Anonymous reservation
This reservation is not tied to a user account. It is managed using the guest’s email and generated reference code.

### Walk-in reservation
This reservation is created by a staff member for a walk-in client.

## Sample login accounts

These sample accounts are created by the seed script:

| Type | Email | Password |
|---|---|---|
| User | mia@vetstappen.com | password1 |
| User | carlo@vetstappen.com | password2 |
| User | alyssa@vetstappen.com | password3 |
| Staff | dr.bea@vetstappen.com | password4 |
| Staff | dr.paolo@vetstappen.com | password5 |

## Technologies used

### Main technologies
- Node.js
- Express
- Express Handlebars
- MongoDB
- Mongoose
- HTML
- CSS
- JavaScript

### Packages and libraries used
- `express` - for the server and routing
- `express-handlebars` - for rendering views
- `mongoose` - for database modeling
- `dotenv` - for environment variables
- `cookie-parser` - for reading cookies
- `multer` - for avatar uploads
- `mongodb-memory-server` - optional temporary database fallback
- `nodemon` - for development auto-restart

### Built-in Node.js modules used
- `crypto`
- `fs`
- `path`

## Authentication and security

The website uses server-side session handling for authentication. Passwords are not stored in plain text. They are hashed before being saved to the database. Sessions are stored so that logged-in users stay signed in until they log out or close their browser session. This is part of the Phase 3 requirements covered by the project. :contentReference[oaicite:2]{index=2}

## Form validation

The website includes both front-end and back-end validation for important forms. This helps prevent invalid submissions and improves usability.

Examples include:
- required fields
- proper email format
- password rules
- duplicate email checking
- slot conflict checking
- anonymous reservation lookup validation
- avatar upload validation

## Project structure

```text
app.js
package.json
README.md
controllers/
middleware/
model/
routes/
utils/
views/
public/
