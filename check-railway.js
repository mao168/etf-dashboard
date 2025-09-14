#!/usr/bin/env node

// 检查Railway部署状态的脚本

const RAILWAY_URLS = [
  'https://etf-dashboard-production.up.railway.app',
  'https://etf-dashboard.railway.app',
  'https://etf-dashboard-backend.railway.app'
];

async function checkHealth(baseUrl) {
  console.log(`\n🔍 检查 ${baseUrl}`);
  console.log('━'.repeat(50));
  
  try {
    // 检查健康端点
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ 健康检查通过:', data);
    } else {
      console.log(`⚠️ 健康检查返回状态码: ${healthResponse.status}`);
    }
    
    // 检查ETF数据端点
    const etfResponse = await fetch(`${baseUrl}/api/etf/current`);
    if (etfResponse.ok) {
      const data = await etfResponse.json();
      console.log('✅ ETF数据端点正常');
      if (data.success && data.data) {
        console.log('   - BTC数据:', data.data.btc ? '✓' : '✗');
        console.log('   - ETH数据:', data.data.eth ? '✓' : '✗');
        console.log('   - 更新时间:', data.data.updateTime || '未知');
      }
    } else {
      console.log(`⚠️ ETF数据端点返回状态码: ${etfResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ 连接失败: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Railway后端部署检查工具');
  console.log('=' .repeat(50));
  
  // 如果你知道确切的Railway URL，在这里添加
  const customUrl = process.argv[2];
  if (customUrl) {
    await checkHealth(customUrl);
    return;
  }
  
  // 尝试常见的Railway URL格式
  let foundWorking = false;
  for (const url of RAILWAY_URLS) {
    const isWorking = await checkHealth(url);
    if (isWorking) {
      foundWorking = true;
      console.log(`\n✅ 找到工作的后端: ${url}`);
      console.log('\n📝 请在Netlify中设置环境变量:');
      console.log(`   VITE_API_BASE_URL=${url}/api`);
      break;
    }
  }
  
  if (!foundWorking) {
    console.log('\n❌ 未找到工作的Railway后端');
    console.log('\n可能的问题:');
    console.log('1. Railway部署还在进行中');
    console.log('2. Railway域名不同于预期');
    console.log('3. 后端启动失败');
    console.log('\n请检查Railway控制台的部署日志');
    console.log('\n如果你知道Railway URL，请运行:');
    console.log('   node check-railway.js https://你的railway域名.railway.app');
  }
}

main().catch(console.error);