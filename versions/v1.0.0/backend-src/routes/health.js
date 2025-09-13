import express from 'express';

const router = express.Router();

// GET /api/health - 基础健康检查
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// GET /api/health/detailed - 详细健康检查
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'healthy', // TODO: 实际数据库检查
      sosoValueAPI: 'checking...',
      cache: 'healthy'
    },
    system: {
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };

  try {
    // 这里可以添加更多服务检查
    res.json(healthCheck);
  } catch (error) {
    res.status(503).json({
      ...healthCheck,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;