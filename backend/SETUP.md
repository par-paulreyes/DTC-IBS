# Backend Setup Guide

## Environment Configuration

Create a `.env` file in the backend directory with the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-database-password
DB_NAME=dtc_ibs

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for login notifications)
# For Gmail, you'll need to use an App Password: https://support.google.com/accounts/answer/185833
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=admin@example.com
```

## Email Setup for Login Notifications

To enable email notifications when users sign in:

1. **For Gmail:**
   - Enable 2-factor authentication on your Google account
   - Generate an App Password: https://support.google.com/accounts/answer/185833
   - Use the App Password in `EMAIL_PASS`

2. **For other providers:**
   - Update `EMAIL_HOST` and `EMAIL_PORT` according to your provider
   - Use your email credentials in `EMAIL_USER` and `EMAIL_PASS`

## Database Schema Update

After setting up the environment, run the schema update script:

```bash
npm run update-schema
```

This will:
- Add password fields to the students table
- Set default passwords for existing users (changeme123)
- Add timestamp fields for user management

## Security Notes

- Change the `JWT_SECRET` to a strong, unique value
- Use strong passwords for database and email accounts
- Consider using environment-specific configurations for production
- The email notification feature is optional and won't break login if not configured 