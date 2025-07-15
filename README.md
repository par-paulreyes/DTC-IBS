# DTC Inventory Borrowing System (DTC-IBS)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage Guide](#usage-guide)
  - [Login & Registration](#login--registration)
  - [Dashboard](#dashboard)
  - [Inventory Management](#inventory-management)
  - [Maintenance Logs](#maintenance-logs)
  - [Profile Management](#profile-management)
  - [Maintenance & Administration](#maintenance--administration)
- [Troubleshooting & Tips](#troubleshooting--tips)

---

## Overview

The DTC Inventory Borrowing System (DTC-IBS) is a full-stack web application for managing inventory, borrowing, and maintenance of items at the Digital Transformation Center, Batangas State University. It supports user and admin roles, and robust authentication.

---

## Features

- User and admin authentication (JWT, password hashing)
- Email verification and notifications
- Role-based access control
- Inventory management (add, edit, delete, view items)
- Borrowing and returning items with approval workflow
- Maintenance logs and status tracking
- Responsive dashboard for users and admins
- RESTful API (Node.js/Express)
- Modern frontend (Next.js, React, Tailwind CSS)
- MySQL database

---

## System Architecture

```
[User/Admin] <---> [Frontend (Next.js)] <---> [Backend (Node.js/Express)] <---> [MySQL Database]
```

- **Frontend**: Next.js (React, TypeScript, Tailwind CSS)
- **Backend**: Node.js, Express, JWT, bcrypt, nodemailer
- **Database**: MySQL

---

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)
- MySQL Server
- (Optional) Vercel account for deployment

---

## Setup Guide

### Database Setup

1. **Create the Database and Tables**

   Use the provided `database_setup.sql` to create the schema:

   ```sql
   -- Run in MySQL CLI or a GUI tool
   source database_setup.sql;
   ```

   This will create the `students`, `items`, and other required tables.

2. **Add Sample Data (Optional)**

   In the backend directory, run:

   ```bash
   npm run sample-data
   ```

   This will add sample users, items, and borrow requests.

---

### Backend Setup

1. **Configure Environment Variables**

   Copy `.env.example` to `.env` in the `backend/` directory and fill in your credentials:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-database-password
   DB_NAME=dtc_ibs
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_TO=admin@example.com
   ```

2. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Run Database Migration/Update Scripts**

   - To update schema: `npm run update-schema`
   - To add password fields: `npm run add-password-field`
   - To update existing passwords: `npm run update-passwords`
   - To create admin user: `npm run create-admin`

4. **Start the Backend Server**

   ```bash
   npm run dev
   # or
   npm start
   ```

---

### Frontend Setup

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**

   Create a `.env.local` file in `frontend/`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   (Or use your deployed backend URL.)

3. **Run the Frontend**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

4. **Deploying to Vercel**

   - Connect your repo to Vercel.
   - Set `NEXT_PUBLIC_API_URL` in Vercel project settings.
   - Deploy!

---

## Usage Guide

### Login & Registration

- **Login**: Go to `/login`, enter your BatStateU email and password.
- **Registration**: Go to `/signup`, enter your email and password. Check your email for a verification link.
- **Email Verification**: After signup, verify your email via the link sent to your inbox.
- **Resend Verification**: If needed, use `/resend-verification`.

**Default Passwords:**
- Students: Password is their student ID (e.g., `22-00869`).
- Admin: Email `99-99999@g.batstate-u.edu.ph`, password `99-99999`.

---

### Dashboard

- **User Dashboard**: View your borrow requests, returned items, and their statuses.
- **Admin Dashboard**: Manage all requests, approve/decline, process borrow/return, view logs, and edit/delete logs.

---

### Inventory Management

- **View Items**: All users can view available items.
- **Borrow Items**: Users can select items, schedule pick-up/return dates, and submit requests.
- **Cancel Requests**: Users can cancel pending requests.

---

### Maintenance Logs

- **Logs**: Admins can view, filter, edit, and delete maintenance and borrow logs.
- **Status Tracking**: Each item/request has a status (To be Borrowed, Approved, Borrowed, Returned, Declined, Cancelled).

---

### Profile Management

- **User Info**: Users can view their profile and request history.
- **Password Management**: Passwords are hashed; currently, password changes are managed by admins or via database.

---

### Maintenance & Administration

- **Admin Creation**: Run `npm run create-admin` in backend to create or update the admin user.
- **Sample Data**: Run `npm run sample-data` to populate the database for testing.
- **Database View**: Run `npm run view-database` to inspect tables and user status.

---

## Troubleshooting & Tips

### Common Issues

- **Login Issues**: Check email format and password. Ensure backend is running.
- **Admin Access**: Ensure admin user exists and has the correct role.
- **Database Errors**: Check `.env` configuration and run migration scripts.
- **API Connection**: Ensure `NEXT_PUBLIC_API_URL` is correct and backend is accessible.
- **Email Issues**: For Gmail, use an App Password and enable 2FA.

### Useful Scripts

- `npm run update-schema` — Update DB schema for new fields.
- `npm run add-password-field` — Add password column to students.
- `npm run update-passwords` — Set default passwords for all users.
- `npm run create-admin` — Create or update admin user.
- `npm run sample-data` — Add sample users, items, and requests.
- `npm run view-database` — View database structure and user info.

### Security Notes

- Change all default passwords after setup.
- Use strong secrets and passwords in production.
- Restrict API and database access as needed.

---

**For more details, see the `backend/SETUP.md`, `PASSWORD_SETUP.md`, and `frontend/DEPLOYMENT.md` files.**

---

If you need further help, please check the documentation in each subdirectory or contact the system administrator. 