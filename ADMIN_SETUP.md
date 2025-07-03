# 🛠 Admin Setup Guide

## 🚀 Quick Admin Setup

### 1. **Create Admin User**
```bash
cd backend
npm run create-admin
```

This creates an admin user with:
- **Email**: `99-99999@g.batstate-u.edu.ph`
- **Role**: `admin`

### 2. **Add Sample Data**
```bash
cd backend
npm run sample-data
```

This adds:
- 3 sample students
- 5 sample items (Laptop, Projector, Tablet, Camera, Microphone)
- 3 sample borrow requests (pending, approved, borrowed)

### 3. **Start Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. **Access Admin Dashboard**
- Go to: http://localhost:3000/login
- Login with: `99-99999@g.batstate-u.edu.ph`
- Click "Admin" in the navbar

## 👨‍💼 Admin Features

### **Dashboard Tabs:**

#### 📋 **Pending for Approval**
- View requests waiting for admin approval
- **Actions**: Approve / Decline buttons
- Shows user email, items, dates

#### ✅ **Approved**
- View requests that have been approved
- **Actions**: Scan to Borrow button
- Ready for item pickup

#### 📦 **Borrowed**
- View currently borrowed items
- **Actions**: Scan to Return button
- Track active borrows

### **Admin Actions:**

#### **Approve Request**
- Changes status from `pending` → `approved`
- Item becomes available for pickup

#### **Decline Request**
- Changes status from `pending` → `declined`
- Request is rejected

#### **Scan to Borrow**
- Changes status from `approved` → `borrowed`
- Item is officially borrowed

#### **Scan to Return**
- Changes status from `borrowed` → `returned`
- Item is returned to inventory

## 🔧 Admin API Endpoints

### **GET Requests**
- `GET /api/admin/pending` - Get pending requests
- `GET /api/admin/approved` - Get approved requests
- `GET /api/admin/borrowed` - Get borrowed items

### **PUT Requests**
- `PUT /api/admin/approve/:id` - Approve request
- `PUT /api/admin/decline/:id` - Decline request
- `PUT /api/admin/scan-borrow/:id` - Mark as borrowed
- `PUT /api/admin/scan-return/:id` - Mark as returned

## 📊 Sample Data Details

### **Users Created:**
- `student1@sr-code@g.batstate-u.edu.ph` (user)
- `student2@sr-code@g.batstate-u.edu.ph` (user)
- `student3@sr-code@g.batstate-u.edu.ph` (user)

### **Items Created:**
1. **LAP001** - Dell Latitude 5520 Laptop
2. **PROJ001** - Epson EB-X41 Projector
3. **TAB001** - iPad Pro 12.9" Tablet
4. **CAM001** - Canon EOS R6 Camera
5. **MIC001** - Shure SM58 Microphone

### **Sample Requests:**
- Student 1: Laptop (pending)
- Student 2: Projector (approved)
- Student 3: Tablet (borrowed)

## 🎯 Testing Admin Workflow

### **Complete Workflow Test:**

1. **Login as Admin**
   ```
   Email: 99-99999@g.batstate-u.edu.ph
   ```

2. **Check Pending Tab**
   - Should see Student 1's laptop request
   - Click "Approve" to move to Approved tab

3. **Check Approved Tab**
   - Should see Student 2's projector request
   - Click "Scan to Borrow" to move to Borrowed tab

4. **Check Borrowed Tab**
   - Should see Student 3's tablet request
   - Click "Scan to Return" to complete cycle

## 🔒 Security Features

- **Role-based Access**: Only users with `role: 'admin'` can access admin pages
- **JWT Authentication**: All admin endpoints require valid token
- **Email Validation**: Only Batangas State University emails allowed

## 🚨 Troubleshooting

### **Admin Tab Not Visible**
- Ensure you're logged in with admin role
- Check browser console for errors
- Verify JWT token is valid

### **No Data in Admin Dashboard**
- Run `npm run sample-data` to add test data
- Check database connection
- Verify tables exist

### **API Errors**
- Ensure backend server is running
- Check database credentials in `.env`
- Verify all tables are created

## 📝 Admin User Management

### **Create Additional Admin Users**
```sql
INSERT INTO students (email, role) VALUES ('newadmin@sr-code@g.batstate-u.edu.ph', 'admin');
```

### **Change User Role**
```sql
UPDATE students SET role = 'admin' WHERE email = 'user@sr-code@g.batstate-u.edu.ph';
```

### **List All Admins**
```sql
SELECT email, role FROM students WHERE role = 'admin';
```

---

**🎉 Your admin system is now ready! Test all features and enjoy managing your inventory!** 