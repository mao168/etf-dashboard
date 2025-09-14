import axios from 'axios';

class SoSoValueService {
  constructor() {
    this.baseURL = process.env.SOSO_BASE_URL || 'https://api.sosovalue.xyz';
    this.apiKey = process.env.SOSO_API_KEY || 'SOSO-a929b0c0a07e40bf80e2f424cd45110f';
    this.cache = new Map();
    this.cacheTimeout = 300 * 1000; // 5 minutes
  }

  createAxiosInstance() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-soso-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async fetchCurrentETFData(type) {
    const cacheKey = `current-${type}`;
    
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const api = this.createAxiosInstance();
      
      const response = await api.post('/openapi/v2/etf/currentEtfDataMetrics', {
        type: type
      });

      if (response.status === 200 && response.data) {
        const transformedData = this.transformCurrentData(response.data, type);
        this.setCachedData(cacheKey, transformedData);
        return transformedData;
      }

      throw new Error(`Invalid response: ${response.status}`);
    } catch (error) {
      const expiredCache = this.cache.get(cacheKey);
      if (expiredCache) {
        return expiredCache.data;
      }
      throw error;
    }
  }

  transformCurrentData(apiData, type) {
    const symbol = type === 'us-btc-spot' ? 'BTC' : 'ETH';
    
    const data = apiData.data || apiData;
    const dailyInflow = parseFloat(data.dailyNetInflow?.value || 0);
    const totalAssets = parseFloat(data.totalNetAssets?.value || 0);
    const marketRatio = parseFloat(data.totalNetAssetsPercentage?.value || 0) * 100;
    const cumulativeInflow = parseFloat(data.cumNetInflow?.value || 0);
    const lastUpdateDate = data.dailyNetInflow?.lastUpdateDate || data.totalNetAssets?.lastUpdateDate || new Date().toISOString().split('T')[0];
    
    return {
      symbol: symbol,
      dailyInflow: dailyInflow,
      totalAssets: totalAssets,
      marketRatio: marketRatio,
      cumulativeInflow: cumulativeInflow,
      trend: dailyInflow >= 0 ? 'up' : 'down',
      updateTime: new Date().toISOString(),
      lastUpdateDate: lastUpdateDate,
      source: 'sosovalue-api'
    };
  }

  async fetchAllCurrentData() {
    try {
      const [btcData, ethData] = await Promise.all([
        this.fetchCurrentETFData('us-btc-spot'),
        this.fetchCurrentETFData('us-eth-spot')
      ]);

      const apiDataDate = btcData.lastUpdateDate || ethData.lastUpdateDate || '2025-09-12';
      
      const updateDate = new Date(apiDataDate + 'T00:00:00');
      updateDate.setDate(updateDate.getDate() + 1);
      updateDate.setHours(9, 30, 0, 0);
      
      const formattedUpdateTime = updateDate.toLocaleString('zh-CN', {
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '/') + ' HKT';

      return {
        btc: btcData,
        eth: ethData,
        updateTime: formattedUpdateTime,
        apiDataDate: apiDataDate,
        actualFetchTime: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error('Error fetching all ETF data:', error);
      throw error;
    }
  }

  generateAIInsight(btcData, ethData) {
    const btcFlow = btcData.dailyInflow >= 0 ? '净流入' : '净流出';
    const ethFlow = ethData.dailyInflow >= 0 ? '净流入' : '净流出';
    const btcAmount = (Math.abs(btcData.dailyInflow) / 100000000).toFixed(2);
    const ethAmount = (Math.abs(ethData.dailyInflow) / 100000000).toFixed(2);

    return `今日 BTC ETF ${btcFlow} ${btcAmount} 亿美元，ETH ETF ${ethFlow} ${ethAmount} 亿美元。

${btcData.dailyInflow >= 0 && ethData.dailyInflow >= 0 ? 
  '双币种ETF均录得净流入，显示机构资金持续加码加密货币资产。市场情绪积极，投资者对加密货币前景保持乐观。' :
  btcData.dailyInflow < 0 && ethData.dailyInflow < 0 ? 
  '双币种ETF均出现净流出，可能反映短期获利回吐或市场谨慎情绪。建议关注后续资金流向变化。' :
  '双币种ETF资金流向分化，显示投资者对不同加密资产的差异化配置策略。'
}

建议持续关注ETF资金流向变化，结合技术面分析判断市场趋势。投资有风险，决策需谨慎。`;
  }
}

const sosoService = new SoSoValueService();

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const etfData = await sosoService.fetchAllCurrentData();
    const aiInsight = sosoService.generateAIInsight(etfData.btc, etfData.eth);

    res.status(200).json({
      success: true,
      data: {
        ...etfData,
        aiInsight: aiInsight
      }
    });
  } catch (error) {
    console.error('ETF API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ETF data',
      message: error.message
    });
  }
}