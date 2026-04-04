const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import routes
const invoiceRoutes = require('./routes/invoice');
const paymentRoutes = require('./routes/payments');
const refundRoutes = require('./routes/refunds');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const bankTransferRoutes = require('./routes/bankTransfer');

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ UniNest API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API endpoint working!',
    status: 'success'
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Routes setup
app.use('/api/invoice', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bank-transfer', bankTransferRoutes);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 UniNest Backend Server Started!');
  console.log('='.repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  console.log('💡 Press Ctrl+C to stop the server');
  console.log('='.repeat(50));
});