import express from 'express';
import sosoValueService from '../services/sosovalue.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// GET /api/etf/current - 获取当前ETF数据
router.get('/current', asyncHandler(async (req, res) => {
  try {
    const data = await sosoValueService.fetchAllCurrentData();
    
    // 添加AI解读
    const aiInsight = sosoValueService.generateAIInsight(data.btc, data.eth);
    
    res.json({
      success: true,
      data: {
        ...data,
        aiInsight
      }
    });
  } catch (error) {
    console.error('Error fetching current ETF data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ETF data',
      message: error.message
    });
  }
}));

// POST /api/etf/refresh - 手动刷新数据
router.post('/refresh', asyncHandler(async (req, res) => {
  try {
    // 清除缓存
    sosoValueService.cache.clear();
    console.log('🔄 Cache cleared, fetching fresh data...');
    
    const data = await sosoValueService.fetchAllCurrentData();
    const aiInsight = sosoValueService.generateAIInsight(data.btc, data.eth);
    
    res.json({
      success: true,
      message: 'Data refreshed successfully',
      data: {
        ...data,
        aiInsight
      }
    });
  } catch (error) {
    console.error('Error refreshing ETF data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh ETF data',
      message: error.message
    });
  }
}));

// GET /api/etf/history - 获取历史数据 (暂时返回模拟数据)
router.get('/history', asyncHandler(async (req, res) => {
  const { symbol, days = 30 } = req.query;
  
  // 生成模拟历史数据
  const generateMockHistory = (baseInflow, symbolName) => {
    const history = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const variation = (Math.random() - 0.5) * 0.6;
      const inflowAmount = Math.round(baseInflow * (1 + variation));
      
      history.push({
        date: dateStr,
        inflow: Math.abs(inflowAmount),
        type: inflowAmount >= 0 ? "inflow" : "outflow"
      });
    }
    return history.reverse();
  };

  try {
    let historyData = {};
    
    if (symbol) {
      const baseInflow = symbol.toUpperCase() === 'BTC' ? 350000000 : 120000000;
      historyData[symbol.toLowerCase()] = generateMockHistory(baseInflow, symbol);
    } else {
      historyData.btc = generateMockHistory(350000000, 'BTC');
      historyData.eth = generateMockHistory(120000000, 'ETH');
    }

    res.json({
      success: true,
      data: historyData
    });
  } catch (error) {
    console.error('Error fetching history data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history data',
      message: error.message
    });
  }
}));

// GET /api/etf/status - 获取API状态
router.get('/status', asyncHandler(async (req, res) => {
  try {
    const healthCheck = await sosoValueService.healthCheck();
    const cacheSize = sosoValueService.cache.size;
    
    res.json({
      success: true,
      status: {
        sosoValueAPI: healthCheck,
        cache: {
          size: cacheSize,
          ttl: `${process.env.CACHE_TTL || 300}s`
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
      message: error.message
    });
  }
}));

export default router;