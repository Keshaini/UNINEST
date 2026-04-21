# 🚀 Quick Start - Complaint System

## ▶️ Running the System

### Start Backend Server
```bash
cd backend
npm install  # if needed
npm start
```
Expected: `✅ MongoDB Connected successfully` and `📡 Server running on: http://localhost:5000`

### Start Frontend Server
```bash
cd frontend
npm install  # if needed
npm run dev
```
Expected: Vite dev server running on `http://localhost:5173`

---

## 🧪 Testing Complaint Endpoints

### Method 1: REST Client (Easiest)
1. Install "REST Client" extension in VS Code
2. Open `backend/complaints.http`
3. Click "Send Request" on any endpoint
4. Replace `{{complaintId}}` with real MongoDB IDs

### Method 2: Using Frontend UI

**Student Side:**
1. Go to `/complaints` page
2. Fill complaint form:
   - Category: maintenance/cleaning/security/utilities/general
   - Title: "Water leaking in bathroom"
   - Description: Detailed explanation
3. Click "Submit Complaint"
4. View your complaint history instantly

**Admin Side:**
1. Go to `/admin/manage-complaints`
2. See all student complaints in table format
3. Update status dropdown: pending → in_progress → resolved
4. Add support notes
5. Delete complaints if needed

---

## 📋 API Quick Reference

### Authentication
- All requests need: `Authorization: Bearer {token}`
- Get token from login endpoint
- Token stored in localStorage on client

### Complaint Categories
- `maintenance` - Repair issues
- `cleaning` - Room cleanliness
- `security` - Safety concerns
- `utilities` - Power, water, internet
- `general` - Other issues

### Complaint Status
- `pending` - Awaiting response
- `in_progress` - Being worked on
- `resolved` - Fixed & closed
- `rejected` - Cannot fix

### Priority Levels
- `low` - Not urgent
- `medium` - Standard
- `high` - Important
- `urgent` - ASAP

---

## 🔑 Key Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/complaints/student/submit` | Student | Create complaint |
| GET | `/api/complaints/student/history/:studentId` | Student | My complaints |
| GET | `/api/complaints/support/all` | Admin | All complaints |
| PATCH | `/api/complaints/support/update/:id` | Admin | Update status |
| DELETE | `/api/complaints/support/remove/:id` | Admin | Delete complaint |
| GET | `/api/complaints/support/overview-stats` | Admin | Dashboard stats |

---

## 💬 Chat/Messaging

### Student Sends Message:
```bash
POST /api/complaints/student/ticket/{id}/messages/{studentId}/send
{
  "senderName": "John Doe",
  "message": "Can you provide an update?"
}
```

### Admin Adds Note:
```bash
PATCH /api/complaints/support/update/{id}
{
  "supportNotes": "Technician will visit tomorrow at 2 PM",
  "assignedTo": "John Smith"
}
```

---

## ✅ Verification Checklist

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Frontend pages load (Complaints & ManageComplaints)
- [ ] Student can submit complaint form
- [ ] Admin can see complaints list
- [ ] Admin can update complaint status
- [ ] Complaint appears/updates in real-time
- [ ] Error messages display properly

---

## 🆘 Troubleshooting

### "Cannot connect to backend"
- Check backend is running on http://localhost:5000
- Verify MongoDB is running
- Check CORS settings in server.js

### "No token, authorization denied"
- Make sure you're logged in
- Token is in localStorage under key "token"
- Check token hasn't expired

### "Not authorized as admin"
- Check user has role="Admin" in database
- Verify admin token is being used
- Check JWT_SECRET matches in .env

### "Complaint not found"
- Verify complaint ID exists in database
- Check you're using same studentId
- Student can only see own complaints

---

## 📊 File Structure

```
backend/
├── routes/complaints.js ← All endpoints defined here
├── controllers/
│   ├── complaintController.js ← Imports all functions
│   └── complaints/ ← Individual functions
├── models/Complaint.js ← Database schema
└── middleware/authMiddleware.js ← Token verification

frontend/
├── pages/
│   ├── Complaints.jsx ← Student page
│   └── admin/ManageComplaints.jsx ← Admin page
└── services/complaintsService.js ← API calls
```

---

## 🎯 Next: Advanced Features

- Real-time updates with Socket.IO
- File upload attachments
- Email notifications
- Automated escalation
- PDF report generation

---

**For detailed integration guide, see:** `COMPLAINT_SYSTEM_INTEGRATION.md`
