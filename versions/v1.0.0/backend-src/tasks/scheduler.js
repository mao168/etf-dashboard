import cron from 'node-cron';
import sosoValueService from '../services/sosovalue.js';
import { saveHistoryData } from '../config/database.js';

let schedulerRunning = false;

export function startScheduler() {
  if (schedulerRunning) {
    console.log('⚠️ Scheduler already running');
    return;
  }

  console.log('⏰ Starting data update scheduler...');
  
  // 每5分钟更新数据 (美股交易时间更频繁)
  const updateInterval = process.env.DATA_UPDATE_INTERVAL || 5;
  
  cron.schedule(`*/${updateInterval} * * * *`, async () => {
    try {
      console.log('🔄 Scheduled data update started...');
      
      // 清除过期缓存
      sosoValueService.cache.clear();
      
      // 获取最新数据
      const data = await sosoValueService.fetchAllCurrentData();
      
      // 保存到数据库
      await Promise.all([
        saveHistoryData('BTC', data.btc),
        saveHistoryData('ETH', data.eth)
      ]);
      
      console.log('✅ Scheduled data update completed');
    } catch (error) {
      console.error('❌ Scheduled update error:', error.message);
    }
  });

  // 美股交易时间 (周一到周五 9:30-16:00 EST，对应北京时间 22:30-05:00)
  // 在交易时间每2分钟更新一次
  cron.schedule('*/2 22-23 * * 1-5', async () => {
    console.log('🚀 High-frequency update (trading hours)...');
    sosoValueService.cache.clear();
    try {
      await sosoValueService.fetchAllCurrentData();
    } catch (error) {
      console.error('❌ High-frequency update error:', error.message);
    }
  });

  cron.schedule('*/2 0-5 * * 2-6', async () => {
    console.log('🚀 High-frequency update (trading hours)...');
    sosoValueService.cache.clear();
    try {
      await sosoValueService.fetchAllCurrentData();
    } catch (error) {
      console.error('❌ High-frequency update error:', error.message);
    }
  });

  // 每天清理过期的缓存数据
  cron.schedule('0 6 * * *', async () => {
    console.log('🧹 Daily cleanup started...');
    try {
      // 清理内存缓存
      sosoValueService.cache.clear();
      console.log('✅ Daily cleanup completed');
    } catch (error) {
      console.error('❌ Daily cleanup error:', error.message);
    }
  });

  schedulerRunning = true;
  console.log('✅ Scheduler started successfully');
  console.log(`📊 Data update interval: ${updateInterval} minutes`);
  console.log('🕒 High-frequency updates during US trading hours');
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