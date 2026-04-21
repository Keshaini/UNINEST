const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const createSocketServer = require('./socket/createSocketServer');

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5176'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Serve uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global request logger
// app.use((req, res, next) => {
//   console.log(`🔵 ${req.method} ${req.path}`);
//   next();
// });

// =======================
// 🛣 ROUTES
// =======================
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const complaintsRoutes = require('./routes/complaints');
const noticeRoutes = require('./routes/noticeRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load new routes
const bookingRoutes    = require('./routes/bookingRoutes');
const transferRoutes   = require('./routes/transferRoutes');
const invoiceRoutes    = require('./routes/invoice');
const paymentRoutes    = require('./routes/payments');
const reportRoutes     = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// =======================
// 🧪 TEST ROUTES
// =======================
app.get('/', (req, res) => {
  res.json({ message: '✅ UniNest API is running!' });
});
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ API endpoint working!', status: 'success' });
});

// =======================
// 📦 DATABASE & START SERVER
// =======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected successfully');
        createSocketServer(httpServer, FRONTEND_ORIGINS);
        httpServer.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 UniNest Backend Server Started!');
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log('='.repeat(50));
        });
    })
    .catch(err => console.error('❌ DB Error:', err));
