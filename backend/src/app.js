require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { sequelize, testConnection } = require('./config');
const blockchainService = require('./services/blockchainService');

// Debug guards to surface silent exits and unhandled errors
process.on('exit', (code) => console.log(`[process.exit] code=${code}`));
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const investmentRoutes = require('./routes/investments');
const milestoneRoutes = require('./routes/milestones');
const blockchainRoutes = require('./routes/blockchain');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'INFRACHAIN API is running',
    timestamp: new Date().toISOString(),
    database: 'connected',
    blockchain: 'connected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/blockchain', blockchainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. API will run with limited functionality.');
    }

    // Sync database models (development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized');
    }

    // Start blockchain event listeners
    try {
      blockchainService.listenToEvents();
      console.log('✅ Blockchain event listeners started');
    } catch (blockchainError) {
      console.warn('⚠️  Blockchain connection issue:', blockchainError.message);
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`   INFRACHAIN Backend Server Running`);
      console.log('========================================');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`⛓️  Blockchain: ${process.env.BLOCKCHAIN_RPC_URL || 'Not configured'}`);
      console.log('========================================');
      console.log('');
    });

    server.on('close', () => console.log('[server] close event fired'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
