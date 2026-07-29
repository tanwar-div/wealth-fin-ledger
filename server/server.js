require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const habitRoutes = require('./routes/habitRoutes');
const goalRoutes = require('./routes/goalRoutes');
const assetRoutes = require('./routes/assetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Only connect to MongoDB when this file is run directly (not during require-based tests)
if (require.main === module) {
  connectDB();
}

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
