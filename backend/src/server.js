import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import etfRoutes from './routes/etf.js';
import healthRoutes from './routes/health.js';
import { initializeDatabase } from './config/database.js';
import { startScheduler } from './tasks/scheduler.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174', // 新的前端端口
    'http://localhost:3000',
    'https://your-domain.vercel.app' // 部署后更新
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/etf', etfRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 ETF Dashboard API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      etf: '/api/etf',
      docs: 'https://github.com/your-repo/etf-dashboard'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Initializing database...');
    await initializeDatabase();
    
    console.log('⏰ Starting scheduler...');
    startScheduler();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ETF Dashboard API Server running on port ${PORT}`);
      console.log(`📡 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`📊 ETF API: http://0.0.0.0:${PORT}/api/etf`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔑 API Key configured: ${process.env.SOSO_API_KEY ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();