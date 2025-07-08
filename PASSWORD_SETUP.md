# 🔐 Password Authentication Setup

## Overview

The DTC-IBS system now includes password authentication for enhanced security. All users must provide both their email and password to login.

## Default Passwords

### **For Students**
- **Email Format**: `XX-XXXXX@g.batstate-u.edu.ph` (e.g., `22-00869@g.batstate-u.edu.ph`)
- **Default Password**: Student ID (e.g., `22-00869`)
- **Example**: 
  - Email: `22-00869@g.batstate-u.edu.ph`
  - Password: `22-00869`

### **For Admin**
- **Email**: `99-99999@g.batstate-u.edu.ph`
- **Password**: `99-99999`

## Setup Instructions

### 1. **Update Existing Users**
If you have existing users in your database, run:
```bash
cd backend
npm run update-passwords
```

This will set default passwords for all existing users based on their student ID.

### 2. **Create Admin User**
```bash
cd backend
npm run create-admin
```

### 3. **Add Sample Data**
```bash
cd backend
npm run sample-data
```

## Login Process

1. **Go to**: http://localhost:3000/login
2. **Enter Email**: Your Batangas State University email
3. **Enter Password**: Your student ID (default) or custom password
4. **Click Login**

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **Email Validation**: Only Batangas State University emails are accepted
- **JWT Tokens**: Secure session management
- **Role-based Access**: Different permissions for users and admins

## Password Management

### **For New Users**
When a new user logs in for the first time:
- A new account is automatically created
- Default password is set to their student ID
- They can login immediately

### **Changing Passwords**
Currently, passwords can only be changed through database updates. Future versions may include a password change feature.

## Troubleshooting

### **Login Issues**
- Ensure email format is correct: `XX-XXXXX@g.batstate-u.edu.ph`
- Check that password matches your student ID
- Verify backend server is running

### **Admin Access Issues**
- Ensure admin user exists: `npm run create-admin`
- Use correct admin credentials: `99-99999@g.batstate-u.edu.ph` / `99-99999`
- Check that user has `admin` role in database

### **Database Issues**
- Run `npm run update-passwords` to fix missing passwords
- Check database connection in `.env` file
- Verify all tables exist and have correct schema

## Sample Users

After running `npm run sample-data`, you can test with:

| Email | Password | Role |
|-------|----------|------|
| `22-00869@g.batstate-u.edu.ph` | `22-00869` | user |
| `22-00870@g.batstate-u.edu.ph` | `22-00870` | user |
| `22-00871@g.batstate-u.edu.ph` | `22-00871` | user |
| `99-99999@g.batstate-u.edu.ph` | `99-99999` | admin |

## API Changes

### **Login Endpoint**
- **URL**: `POST /api/auth/login`
- **Body**: 
  ```json
  {
    "email": "22-00869@g.batstate-u.edu.ph",
    "password": "22-00869"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "22-00869@g.batstate-u.edu.ph",
      "role": "user"
    }
  }
  ```

---

**🔐 Your system is now secure with password authentication!** 