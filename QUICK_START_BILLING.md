# 💳 Quick Start - Billing & Payment System

## ▶️ Accessing Billing Features

### For Admin Users

1. **Login as Admin**
   - Go to `http://localhost:5173/admin-login`
   - Enter admin credentials

2. **Access Billing Dashboard**
   - Click on "Billing" sidebar item
   - View payment verification page with pending transfers
   - Update payment statuses

3. **Manage Invoices**
   - Click "Invoices" sidebar item
   - View all student invoices
   - Create new invoices for students
   - Track payment status

4. **View Financial Reports**
   - Click "Reports" sidebar item
   - See total billed vs collected
   - View monthly payment trends
   - Download payment reports
   - Export payment data

5. **Manage Discounts**
   - Click "Discounts" sidebar item
   - Create scholarships/discounts
   - Set validity periods
   - Track usage
   - Enable/disable as needed

---

## 📊 Dashboard Statistics

The admin dashboard shows:
- **Total Invoices** - Count of all invoices
- **Paid Invoices** - Completed payments
- **Pending Payments** - Awaiting payment
- **Revenue** - Total collected amount
- **Outstanding Balance** - Amount due

---

## 💼 Invoice Management

### Creating an Invoice

1. Go to Invoices → Click "Create Invoice"
2. Fill in:
   - Student Name
   - Room Number
   - Invoice Items (Room Fee, Maintenance, etc.)
   - Total Amount
   - Due Date
3. Click Submit
4. Invoice is created and sent to student

### Tracking Invoice Status

Statuses:
- **Unpaid** - Not yet paid
- **Partially Paid** - Part payment received
- **Paid** - Fully paid
- **Overdue** - Past due date

---

## 💰 Payment Processing

### Verifying Bank Transfers

1. Go to Billing → Payment Verification
2. View pending transfers with:
   - Student name
   - Amount
   - Payment reference
   - Date submitted
3. Verify bank slip/receipt
4. Click "Verify" to confirm
5. Payment status updates automatically

### Payment Methods Supported

- Bank Transfer (with slip upload)
- Check Payment
- Online Payment (for future integration)
- Cash Payment

---

## 🎓 Discount Management

### Creating a Discount

1. Go to Discounts → Click "Create Discount"
2. Select discount type:
   - Scholarship (percentage)
   - Fixed amount discount
   - Waiver
3. Set:
   - Student ID
   - Discount amount/percentage
   - Valid from date
   - Valid to date
   - Reason/description
4. Click Create
5. Discount automatically applies to new invoices

### Example Discounts

- 20% Merit Scholarship
- 50% Sports Scholarship
- LKR 5,000 Need-based discount
- 100% Maintenance fee waiver

---

## 📈 Financial Reports

### Available Reports

1. **Financial Summary**
   - Total billed amount
   - Total collected
   - Outstanding balance
   - Collection percentage

2. **Monthly Payment Trend**
   - Bar chart of payments by month
   - Identifies peak payment periods

3. **Payment Method Distribution**
   - Pie chart of payment methods used
   - Bank transfer % vs check % etc.

4. **Outstanding by Student**
   - List of students with balances
   - Amount overdue
   - Days overdue

### Exporting Reports

- Click "Export Payments"
- Select date range
- Choose format (CSV/Excel)
- Download file

---

## 🔄 Payment Status Flow

```
Invoice Created
    ↓
Student Gets Notice
    ↓
Student Pays (Bank Transfer/Check)
    ↓
Admin Receives Payment Proof
    ↓
Admin Verifies on Org
    ↓
Payment Status → "Paid"
    ↓
Student Confirmation Email
```

---

## 📋 Quick Actions

| Action | Path | Steps |
|--------|------|-------|
| Create Invoice | Invoices Tab | Click "Create Invoice" button |
| View All Invoices | Invoices Tab | Auto-loads on click |
| Verify Payment | Billing Tab | Click "Verify" on pending items |
| Create Discount | Discounts Tab | Click "Create Discount" button |
| Export Reports | Reports Tab | Click "Export Payments" button |
| View Analytics | Reports Tab | Charts display automatically |

---

## 💡 Tips & Best Practices

1. **Invoice Timing** - Create invoices at start of semester
2. **Payment Reminders** - Send reminders before due date
3. **Discount Planning** - Plan scholarships in advance
4. **Regular Audits** - Check outstanding balances weekly
5. **Export Records** - Keep monthly backup exports

---

## 🆘 Common Tasks

### Task: Create Invoice for New Student
1. Invoices Tab
2. Click "Create Invoice"
3. Enter student details + fees
4. Submit

### Task: Chase Overdue Payment
1. Reports Tab
2. Look at "Outstanding by Student"
3. Send reminder to that student

### Task: Grant Scholarship
1. Discounts Tab
2. Click "Create Discount"
3. Set scholarship % and period
4. Save

### Task: Verify Student Payment
1. Billing Tab
2. Find student in pending list
3. Check bank slip
4. Click "Verify"
5. Status updates to "Paid"

---

## 🔐 Security Notes

- All payments require admin verification
- Bank slips are required for transfers
- Discounts need approval reason
- Invoice edits are logged
- All transactions are timestamped

---

## 📞 Support

For issues:
- Check MongoDB is running
- Verify admin token validity
- Check backend routes are registered
- Review browser console for errors

---

**Status:** ✅ READY TO USE
