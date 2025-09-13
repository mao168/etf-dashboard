import cron from 'node-cron';
import sosoValueService from '../services/sosovalue.js';
import { saveHistoryData } from '../config/database.js';

let schedulerRunning = false;
let apiCallCount = 0;
let lastResetTime = Date.now();

// API调用频率限制配置
const RATE_LIMITS = {
  DEMO: { perMinute: 20, monthly: 1000 },
  PRO: { perMinute: 60, monthly: 100000 }
};

const API_PLAN = process.env.API_PLAN || 'DEMO';
const currentLimit = RATE_LIMITS[API_PLAN];

// 重置API调用计数
function resetApiCount() {
  const now = Date.now();
  if (now - lastResetTime > 60000) { // 每分钟重置
    apiCallCount = 0;
    lastResetTime = now;
    return true;
  }
  return false;
}

// 检查是否可以调用API
function canCallApi() {
  resetApiCount();
  if (apiCallCount >= currentLimit.perMinute) {
    console.log(`⚠️ API rate limit reached (${apiCallCount}/${currentLimit.perMinute} calls/min)`);
    return false;
  }
  return true;
}

// 智能判断是否需要更新
function shouldUpdate() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // 转换为美东时间 (简单处理，实际需要考虑夏令时)
  const etHour = (hour - 13 + 24) % 24; // 北京时间-13小时 = 美东时间
  
  // 美股交易时间判断 (周一到周五 9:30-16:00 ET)
  const isTradingDay = day >= 1 && day <= 5;
  const isTradingHour = (etHour === 9 && now.getMinutes() >= 30) || 
                         (etHour >= 10 && etHour < 16);
  
  // 交易时间内更频繁更新
  if (isTradingDay && isTradingHour) {
    console.log(`📊 Trading hours detected (ET: ${etHour}:${now.getMinutes()})`);
    return { shouldUpdate: true, interval: 3 }; // 3分钟更新一次
  }
  
  // 盘前盘后时间 (7:00-9:30, 16:00-20:00 ET)
  const isExtendedHour = (etHour >= 7 && etHour < 9) || 
                         (etHour === 9 && now.getMinutes() < 30) ||
                         (etHour >= 16 && etHour < 20);
  
  if (isTradingDay && isExtendedHour) {
    console.log(`📈 Extended hours detected (ET: ${etHour}:${now.getMinutes()})`);
    return { shouldUpdate: true, interval: 10 }; // 10分钟更新一次
  }
  
  // 非交易时间，降低更新频率
  console.log(`😴 Non-trading hours (ET: ${etHour}:${now.getMinutes()})`);
  return { shouldUpdate: true, interval: 30 }; // 30分钟更新一次
}

// 执行数据更新
async function performUpdate() {
  if (!canCallApi()) {
    console.log('⏳ Waiting for rate limit reset...');
    return;
  }
  
  try {
    console.log(`🔄 Data update started (API calls: ${apiCallCount}/${currentLimit.perMinute})`);
    apiCallCount += 2; // 每次更新调用2次API (BTC + ETH)
    
    // 清除过期缓存
    sosoValueService.cache.clear();
    
    // 获取最新数据
    const data = await sosoValueService.fetchAllCurrentData();
    
    // 保存到数据库
    await Promise.all([
      saveHistoryData('BTC', data.btc),
      saveHistoryData('ETH', data.eth)
    ]);
    
    console.log(`✅ Data update completed (Remaining: ${currentLimit.perMinute - apiCallCount} calls)`);
  } catch (error) {
    console.error('❌ Update error:', error.message);
    
    // 如果是429错误（频率限制），增加等待时间
    if (error.response?.status === 429) {
      console.log('🚫 Rate limit hit, backing off...');
      apiCallCount = currentLimit.perMinute; // 标记为已达上限
    }
  }
}

export function startScheduler() {
  if (schedulerRunning) {
    console.log('⚠️ Scheduler already running');
    return;
  }

  console.log('⏰ Starting smart data update scheduler...');
  console.log(`📋 API Plan: ${API_PLAN} (${currentLimit.perMinute} calls/min, ${currentLimit.monthly} calls/month)`);
  
  // 智能调度器 - 根据市场时间动态调整
  let currentInterval = 10; // 默认10分钟
  
  // 主调度逻辑 - 每分钟检查一次是否需要更新
  cron.schedule('* * * * *', async () => {
    const updateConfig = shouldUpdate();
    
    // 检查是否到了更新时间
    const now = new Date();
    if (now.getMinutes() % updateConfig.interval === 0) {
      await performUpdate();
    }
  });
  
  // 交易时间重点更新 (美东时间 9:30-10:30, 15:00-16:00 是最活跃时段)
  // 对应北京时间 22:30-23:30 和 04:00-05:00
  cron.schedule('*/2 22-23 * * 1-5', async () => {
    if (canCallApi()) {
      console.log('🎯 Peak trading hour update (Open)');
      await performUpdate();
    }
  });
  
  cron.schedule('*/2 4-5 * * 2-6', async () => {
    if (canCallApi()) {
      console.log('🎯 Peak trading hour update (Close)');
      await performUpdate();
    }
  });
  
  // 每天清理缓存并重置计数
  cron.schedule('0 6 * * *', async () => {
    console.log('🧹 Daily cleanup started...');
    try {
      sosoValueService.cache.clear();
      apiCallCount = 0;
      console.log('✅ Daily cleanup completed');
    } catch (error) {
      console.error('❌ Daily cleanup error:', error.message);
    }
  });

  schedulerRunning = true;
  console.log('✅ Smart scheduler started successfully');
  console.log('🤖 Dynamic update intervals based on market hours');
  console.log('📊 Manual refresh always available via API endpoint');
}

export function stopScheduler() {
  if (!schedulerRunning) {
    console.log('⚠️ Scheduler not running');
    return;
  }

  cron.destroy();
  schedulerRunning = false;
  console.log('🛑 Scheduler stopped');
}

export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    updateInterval: process.env.DATA_UPDATE_INTERVAL || 5,
    nextUpdate: schedulerRunning ? 'Active' : 'Stopped'
  };
}