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

// GET /api/etf/history - 获取历史数据 (使用真实数据)
router.get('/history', asyncHandler(async (req, res) => {
  const { symbol, days = 30 } = req.query;
  
  try {
    let historyData = {};
    
    if (symbol) {
      const type = symbol.toUpperCase() === 'BTC' ? 'us-btc-spot' : 'us-eth-spot';
      const history = await sosoValueService.fetchHistoricalETFData(type, parseInt(days));
      historyData[symbol.toLowerCase()] = history;
    } else {
      // Fetch both BTC and ETH history
      const [btcHistory, ethHistory] = await Promise.all([
        sosoValueService.fetchHistoricalETFData('us-btc-spot', parseInt(days)),
        sosoValueService.fetchHistoricalETFData('us-eth-spot', parseInt(days))
      ]);
      historyData.btc = btcHistory;
      historyData.eth = ethHistory;
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

// GET /api/etf/test-outflow - 测试净流出显示
router.get('/test-outflow', asyncHandler(async (req, res) => {
  const mockOutflowData = {
    btc: {
      symbol: 'BTC',
      dailyInflow: -350000000, // 负值表示净流出
      totalAssets: 153178171661.53403,
      marketRatio: 6.62007,
      cumulativeInflow: 56832895804.558,
      trend: 'down',
      updateTime: new Date().toISOString(),
      source: 'test-data'
    },
    eth: {
      symbol: 'ETH',
      dailyInflow: -120000000, // 负值表示净流出
      totalAssets: 30351672213.479996,
      marketRatio: 5.383899,
      cumulativeInflow: 13363150207.341,
      trend: 'down',
      updateTime: new Date().toISOString(),
      source: 'test-data'
    },
    updateTime: new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Hong_Kong',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' HKT',
    success: true
  };
  
  const aiInsight = sosoValueService.generateAIInsight(mockOutflowData.btc, mockOutflowData.eth);
  
  res.json({
    success: true,
    data: {
      ...mockOutflowData,
      aiInsight
    }
  });
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