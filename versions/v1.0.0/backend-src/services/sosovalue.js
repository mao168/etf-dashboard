import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class SoSoValueService {
  constructor() {
    this.baseURL = process.env.SOSO_BASE_URL;
    this.apiKey = process.env.SOSO_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = (process.env.CACHE_TTL || 300) * 1000; // 5 minutes default
  }

  // Create axios instance with default config
  createAxiosInstance() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-soso-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📋 Cache hit for ${key}`);
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached data for ${key}`);
  }

  // Fetch current ETF data
  async fetchCurrentETFData(type) {
    const cacheKey = `current-${type}`;
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log(`📡 Fetching fresh data for ${type}...`);
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
      console.error(`❌ Error fetching ${type} data:`, error.message);
      
      // Return cached data if available, even if expired
      const expiredCache = this.cache.get(cacheKey);
      if (expiredCache) {
        console.log(`⚠️ Returning expired cache for ${type}`);
        return expiredCache.data;
      }

      throw error;
    }
  }

  // Transform API response to match frontend format
  transformCurrentData(apiData, type) {
    // SoSoValue API response transformation
    const symbol = type === 'us-btc-spot' ? 'BTC' : 'ETH';
    
    // This needs to be adjusted based on actual API response format
    return {
      symbol: symbol,
      dailyInflow: apiData.dailyInflow || 0,
      totalAssets: apiData.totalAssets || 0,
      marketRatio: apiData.marketRatio || 0,
      cumulativeInflow: apiData.cumulativeInflow || 0,
      trend: apiData.dailyInflow >= 0 ? 'up' : 'down',
      updateTime: new Date().toISOString(),
      source: 'sosovalue-api'
    };
  }

  // Fetch both BTC and ETH data
  async fetchAllCurrentData() {
    try {
      const [btcData, ethData] = await Promise.all([
        this.fetchCurrentETFData('us-btc-spot'),
        this.fetchCurrentETFData('us-eth-spot')
      ]);

      return {
        btc: btcData,
        eth: ethData,
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
    } catch (error) {
      console.error('❌ Error fetching all ETF data:', error);
      throw error;
    }
  }

  // Generate AI insight (mock for now, can integrate with OpenAI later)
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

  // Health check
  async healthCheck() {
    try {
      const api = this.createAxiosInstance();
      const response = await api.get('/health', { timeout: 5000 });
      return { status: 'healthy', response: response.status };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

export default new SoSoValueService();