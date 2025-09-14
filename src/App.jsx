import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Terminal, Activity, Database, Clock, TrendingUp, TrendingDown, Bot, Zap, DollarSign, Target, Wallet, Radio, FileText, Share, MessageCircle, Sparkles, Send, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { fetchETFHistoryData } from './fetchHistoryData';

// API 配置 - 后端服务API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api', // 使用环境变量或本地开发地址
  // API密钥现在由后端处理，前端不再需要
};

// ✅ 正确的API端点已确认
// POST /openapi/v2/etf/currentEtfDataMetrics
// 参数: {"type": "us-btc-spot"} 或 {"type": "us-eth-spot"}

// 获取真实的ETF当日数据 - 通过后端API
const fetchRealETFData = async () => {
  try {
    console.log('📡 获取后端API数据...');
    
    const response = await fetch(`${API_CONFIG.baseURL}/etf/current`);
    
    if (!response.ok) {
      throw new Error(`后端API请求失败: ${response.status}`);
    }

    const apiResponse = await response.json();
    
    console.log('✅ 后端API返回数据:', apiResponse);

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error('后端API数据格式错误');
    }

    // 从后端API格式转换为前端所需格式
    const data = apiResponse.data;
    
    const formatBackendData = (btcData, ethData) => {
      return {
        btc: {
          dailyInflow: btcData.dailyInflow,
          totalAssets: btcData.totalAssets,
          marketRatio: btcData.marketRatio,
          cumulativeInflow: btcData.cumulativeInflow,
          isPositive: btcData.dailyInflow >= 0,
          lastUpdateDate: btcData.updateTime.split('T')[0]
        },
        eth: {
          dailyInflow: ethData.dailyInflow,
          totalAssets: ethData.totalAssets,
          marketRatio: ethData.marketRatio,
          cumulativeInflow: ethData.cumulativeInflow,
          isPositive: ethData.dailyInflow >= 0,
          lastUpdateDate: ethData.updateTime.split('T')[0]
        },
        updateTime: data.updateTime,
        apiDataDate: data.apiDataDate,
        aiInsight: data.aiInsight
      };
    };
    
    const formattedData = formatBackendData(data.btc, data.eth);
    console.log('🎯 格式化后数据:', formattedData);
    return formattedData;

  } catch (error) {
    console.error('❌ 获取真实ETF数据失败:', error);
    throw error;
  }
};

// 获取ETF历史数据 - 已移到fetchHistoryData.js
// 使用导入的fetchETFHistoryData函数替代
/*
const fetchETFHistoryData_OLD = async () => {
  try {
    console.log('📋 获取真实历史数据...');
    
    // 生成模拟的30天历史数据
    const generateMockHistory = (baseInflow, symbol) => {
      const history = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // 生成随机但合理的资金流入流出数据
        const variation = (Math.random() - 0.5) * 0.6; // -30% 到 +30% 的变化
        const inflowAmount = Math.round(baseInflow * (1 + variation));
        
        history.push({
          date: dateStr,
          inflow: Math.abs(inflowAmount),
          type: inflowAmount >= 0 ? "inflow" : "outflow"
        });
      }
      return history.reverse(); // 最新日期在前
    };
    
    const mockApiData = {
      btc: generateMockHistory(350000000, 'BTC'), // 基础3.5亿USD
      eth: generateMockHistory(120000000, 'ETH')  // 基础1.2亿USD
    };
    
    console.log('✅ 历史数据生成完成:', {
      btc: mockApiData.btc.length + ' 条记录',
      eth: mockApiData.eth.length + ' 条记录'
    });
    
    return mockApiData;
  } catch (error) {
    console.error('❌ 生成历史数据失败:', error);
    
    // 返回静态默认数据
    return {
      btc: [
        { date: "2025-09-12", inflow: 300000000, type: "inflow" },
        { date: "2025-09-11", inflow: 120000000, type: "outflow" },
        { date: "2025-09-10", inflow: 450000000, type: "inflow" },
        { date: "2025-09-09", inflow: 230000000, type: "inflow" },
        { date: "2025-09-08", inflow: 80000000, type: "outflow" },
        { date: "2025-09-07", inflow: 180000000, type: "inflow" },
        { date: "2025-09-06", inflow: 90000000, type: "outflow" },
      ],
      eth: [
        { date: "2025-09-12", inflow: 150000000, type: "inflow" },
        { date: "2025-09-11", inflow: 50000000, type: "outflow" },
        { date: "2025-09-10", inflow: 280000000, type: "inflow" },
        { date: "2025-09-09", inflow: 110000000, type: "inflow" },
        { date: "2025-09-08", inflow: 30000000, type: "outflow" },
        { date: "2025-09-07", inflow: 95000000, type: "inflow" },
        { date: "2025-09-06", inflow: 25000000, type: "outflow" },
      ]
    };
  }
};
*/

// Mock 数据
const mockData = {
  updateTime: "2025-09-13 19:25:45 HKT",
  date: "2025年09月13日",
  btc: {
    dailyInflow: 642000000, // 6.42亿 USD
    totalAssets: 153178000000, // 1531.78亿 USD
    marketRatio: 6.62, // 市值占比
    cumulativeInflow: 56833000000, // 568.33亿 USD
    isPositive: true
  },
  eth: {
    dailyInflow: 406000000, // 4.06亿 USD
    totalAssets: 30352000000, // 303.52亿 USD
    marketRatio: 5.38, // 市值占比
    cumulativeInflow: 13363000000, // 133.63亿 USD
    isPositive: true
  },
  getAIInsight: () => {
    const paragraphs = [
      "今日 BTC 和 ETH ETF 均录得显著净流入，显示机构资金持续加码。BTC ETF 净流入 6.42 亿美元，创近期新高，占比稳步提升至 6.62%，机构资金配置意愿强烈。ETH ETF 虽规模较小但表现亮眼，4.06 亿美元净流入反映市场对以太坊生态前景的乐观预期。",
      "从技术面看，两类 ETF 资金流向与现货价格走势高度相关，持续流入有望为价格提供有力支撑。建议关注下周美联储政策动向，若利率环境进一步宽松，加密货币 ETF 或将迎来更大规模资金流入。",
      "风险提示：市场波动较大，投资需谨慎。"
    ];
    return paragraphs.join('\n\n');
  },
  history: {
    btc: [
      { date: "2025-09-12", inflow: 300000000, type: "inflow" },
      { date: "2025-09-11", inflow: -120000000, type: "outflow" },
      { date: "2025-09-10", inflow: 450000000, type: "inflow" },
      { date: "2025-09-09", inflow: 230000000, type: "inflow" },
      { date: "2025-09-08", inflow: -80000000, type: "outflow" },
      { date: "2025-09-07", inflow: 180000000, type: "inflow" },
      { date: "2025-09-06", inflow: -90000000, type: "outflow" },
    ],
    eth: [
      { date: "2025-09-12", inflow: 150000000, type: "inflow" },
      { date: "2025-09-11", inflow: -50000000, type: "outflow" },
      { date: "2025-09-10", inflow: 280000000, type: "inflow" },
      { date: "2025-09-09", inflow: 110000000, type: "inflow" },
      { date: "2025-09-08", inflow: -30000000, type: "outflow" },
      { date: "2025-09-07", inflow: 95000000, type: "inflow" },
      { date: "2025-09-06", inflow: -25000000, type: "outflow" },
    ]
  }
};

// 格式化数字为亿单位
const formatToYi = (amount) => {
  const yi = amount / 100000000;
  return yi >= 0 ? `+${yi.toFixed(2)}亿` : `-${Math.abs(yi).toFixed(2)}亿`;
};

// 生成简洁的播报文案
const generateBroadcastText = (data) => {
  const btcFlow = data.btc.isPositive ? "净流入" : "净流出";
  const ethFlow = data.eth.isPositive ? "净流入" : "净流出";
  const btcEmoji = data.btc.isPositive ? "🟩" : "🟥";
  const ethEmoji = data.eth.isPositive ? "🟩" : "🟥";
  const btcTrend = data.btc.isPositive ? "⬆️" : "⬇️";
  const ethTrend = data.eth.isPositive ? "⬆️" : "⬇️";
  
  // 获取API数据的日期（精确到日）- 优先使用apiDataDate字段
  const apiDate = data.apiDataDate || data.btc.lastUpdateDate || data.eth.lastUpdateDate || '2025-09-12';
  const formattedDate = apiDate.replace(/-/g, '年').replace(/(\d{4})年(\d{2})年(\d{2})/, '$1年$2月$3日') + ' (美东)';
  
  // 使用API的更新时间作为推送时间
  const pushTime = data.updateTime || formatUpdateTime();

  return `🐱 每日 ETF 数据播报

📅 日期：${formattedDate}  
📊 数据类型：US BTC & ETH Spot ETF  
${btcEmoji} BTC ETF 今日为：${btcFlow} ${formatToYi(Math.abs(data.btc.dailyInflow))} USD ${btcTrend}  
${ethEmoji} ETH ETF 今日为：${ethFlow} ${formatToYi(Math.abs(data.eth.dailyInflow))} USD ${ethTrend}  

数据来源：SoSoValue  
推送时间：${pushTime}`;
};

// 复制功能
const copyToClipboard = (text, successMessage) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(successMessage, {
      description: "内容已复制到剪贴板",
    });
  }).catch(() => {
    toast.error("复制失败");
  });
};

// 代码块组件
const CodeBlock = ({ content, title, onCopy }) => {
  return (
    <Card className="bg-gray-900 border-gray-700 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 ring-1 ring-green-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-green-400" />
            <CardTitle className="text-green-400 text-xl font-mono">{title}</CardTitle>
          </div>
          <Button
            onClick={onCopy}
            size="lg"
            variant="outline"
            className="border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 h-12 px-6 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/25"
          >
            <Send className="w-6 h-6 mr-3" />
            一键分享
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-black border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-950 transition-colors duration-200 relative group" onClick={onCopy}>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Copy className="w-5 h-5 text-gray-400 hover:text-green-400" />
          </div>
          <pre className="text-green-400 text-xl font-mono leading-relaxed whitespace-pre-wrap font-tabular-nums pr-8">
            {content}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

// 历史数据行组件
const HistoryRow = ({ item, symbol }) => {
  const isPositive = item.type === 'inflow';
  const amount = Math.abs(item.inflow) / 100000000;
  
  return (
    <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
        <span className="text-gray-300 font-mono text-lg sm:text-xl font-tabular-nums">{item.date}</span>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <span className={`font-mono text-base sm:text-lg md:text-xl font-tabular-nums ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {symbol} {isPositive ? '+' : '-'}{amount.toFixed(2)}亿 USD
        </span>
        {isPositive ? 
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-400" /> : 
          <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-400" />
        }
      </div>
    </div>
  );
};

// ETF 数据卡片组件  
const ETFDataCard = ({ symbol, name, data, date }) => {
  const isPositive = data.isPositive;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-green-400" : "text-red-400";
  const flowText = isPositive ? "净流入" : "净流出";
  const flowEmoji = isPositive ? "🟩" : "🟥";
  const trendArrow = isPositive ? "⬆️" : "⬇️";
  
  // 格式化日期为简短格式 (如: 09-13)
  const formatShortDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') {
      return '09-13'; // 默认值
    }
    const match = dateStr.match(/(\d{4})年(\d{2})月(\d{2})日/);
    if (match) {
      return `${match[2]}-${match[3]}`;
    }
    return dateStr;
  };
  
  // 根据币种设置不同的图标背景色
  const iconBgColor = symbol === "BTC" 
    ? "bg-gradient-to-r from-orange-500 to-yellow-500" 
    : "bg-gradient-to-r from-blue-500 to-purple-500";

  return (
    <Card className="bg-gray-900 border-gray-700 hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg ${iconBgColor} flex items-center justify-center text-white font-bold text-xl sm:text-lg shadow-lg`}>
              {symbol === "BTC" ? (
                "₿"
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:w-5 sm:h-5">
                  <path d="M12 2L4 12l8 10 8-10L12 2zm0 3.8L17.2 12 12 18.2 6.8 12 12 5.8z"/>
                </svg>
              )}
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-100 font-mono">{symbol} ETF</CardTitle>
              <CardDescription className="text-gray-500 font-mono text-sm sm:text-base">{name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-mono ${trendColor}`}>{formatShortDate(date)}</span>
            <TrendIcon className={`w-9 h-9 sm:w-8 sm:h-8 ${trendColor}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 今日净流入 - 最显眼位置 */}
        <div className="p-2 sm:p-4 md:p-5 bg-black border border-gray-700 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-gray-500 text-sm sm:text-base font-mono mb-1">📈 今日净流向:</p>
              <p className={`text-2xl sm:text-3xl font-bold font-tabular-nums ${trendColor} font-mono`}>
                {flowEmoji} {formatToYi(Math.abs(data.dailyInflow))} USD
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant="outline"
                className={`font-mono text-lg sm:text-base px-4 py-2 sm:px-3 sm:py-1.5 border-gray-600 ${trendColor}`}
              >
                {flowText} {trendArrow}
              </Badge>
            </div>
          </div>
        </div>

        {/* 关键指标 - 终端风格 */}
        <div className="bg-black border border-gray-700 rounded-lg p-2 sm:p-4 space-y-2 sm:space-y-2">
          <div className="flex items-center justify-between py-2 sm:py-1.5">
            <span className="text-gray-500 text-sm sm:text-base font-mono">🏦 总资产净值:</span>
            <span className="text-gray-300 font-mono text-base sm:text-lg font-tabular-nums">{formatToYi(data.totalAssets)} USD</span>
          </div>
          
          <div className="flex items-center justify-between py-2 sm:py-1.5 border-t border-gray-800">
            <span className="text-gray-500 text-sm sm:text-base font-mono">📊 市值占比:</span>
            <span className="text-gray-300 font-mono text-base sm:text-lg font-tabular-nums">{data.marketRatio}%</span>
          </div>
          
          <div className="flex items-center justify-between py-2 sm:py-1.5 border-t border-gray-800">
            <span className="text-gray-500 text-sm sm:text-base font-mono">💰 累计净流入:</span>
            <span className="text-gray-300 font-mono text-base sm:text-lg font-tabular-nums">{formatToYi(data.cumulativeInflow)} USD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 时间格式化函数
const formatUpdateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} HKT`;
};

// 创建空的初始状态，表示正在加载
const getInitialLoadingData = () => {
  return {
    updateTime: "正在获取数据...",
    date: formatUpdateTime().split(' ')[0].replace(/-/g, '年').replace(/(\d{4})年(\d{2})年(\d{2})/, '$1年$2月$3日'),
    btc: {
      dailyInflow: 0,
      totalAssets: 0, 
      marketRatio: 0,
      cumulativeInflow: 0,
      isPositive: true
    },
    eth: {
      dailyInflow: 0,
      totalAssets: 0,
      marketRatio: 0, 
      cumulativeInflow: 0,
      isPositive: true
    },
    getAIInsight: () => "正在加载AI智能解读...",
    history: mockData.history, // 历史数据可以先使用mock
    lastFetchTime: new Date().toISOString(),
    isLoading: true
  };
};

// 主应用组件
const App = () => {
  const [data, setData] = useState(getInitialLoadingData());
  const [isLoading, setIsLoading] = useState(true); // 初始状态为加载中
  const [activeTab, setActiveTab] = useState('btc');
  const [historyData, setHistoryData] = useState(mockData.history);
  const [usingRealData, setUsingRealData] = useState(false); // 初始为false，成功获取后设为true
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  let broadcastText = '';
  try {
    broadcastText = generateBroadcastText(data);
  } catch (error) {
    console.error('生成播报文案失败:', error);
    broadcastText = '播报数据加载中...';
  }

  const handleCopyBroadcast = () => {
    copyToClipboard(broadcastText, "📋 播报内容已复制！");
  };

  const handleCopyAI = () => {
    try {
      let aiContent = "AI 解读暂时不可用";
      
      if (typeof data.getAIInsight === 'function') {
        aiContent = data.getAIInsight();
      } else if (data.aiInsight) {
        aiContent = data.aiInsight;
      }
      
      const aiMarkdown = `🤖 AI 解读：\n${aiContent}`;
      copyToClipboard(aiMarkdown, "🤖 AI 解读已复制！");
    } catch (error) {
      console.error('复制AI解读失败:', error);
      copyToClipboard("AI 解读暂时不可用", "⚠️ AI 解读复制失败");
    }
  };

  const loadHistoryData = async () => {
    try {
      console.log('📊 开始加载历史数据...');
      const newHistoryData = await fetchETFHistoryData(API_CONFIG.baseURL);
      console.log('📋 获取到的历史数据:', newHistoryData);
      
      // 验证数据结构
      const isValidData = (data) => {
        return data && 
               data.btc && Array.isArray(data.btc) && data.btc.length > 0 &&
               data.eth && Array.isArray(data.eth) && data.eth.length > 0;
      };
      
      if (isValidData(newHistoryData)) {
        console.log('✅ 数据验证通过，更新历史数据状态');
        setHistoryData(newHistoryData);
        toast.success("📊 历史数据已加载", {
          description: `真实数据：过去30日记录 (BTC: ${newHistoryData.btc.length}条, ETH: ${newHistoryData.eth.length}条)`,
        });
      } else {
        console.log('⚠️  API数据格式不正确，使用备用数据');
        setHistoryData(mockData.history);
        console.log('📊 使用历史静态数据');
      }
    } catch (error) {
      console.error('❌ 加载历史数据失败:', error);
      setHistoryData(mockData.history);
      console.log('❌ 数据加载失败，使用备用数据');
    }
  };

  const loadRealData = async () => {
    try {
      console.log('🚀 开始加载真实ETF数据...');
      setIsLoading(true);
      const realETFData = await fetchRealETFData();
      
      // 使用后端API提供的真实更新时间
      const updatedRealData = {
        ...realETFData,
        // 保持后端API提供的updateTime，这是真实的数据获取时间
        lastFetchTime: new Date().toISOString() // 仅记录前端获取时间用于调试
      };
      
      // Claude的动态AI解读生成函数
      const generateClaudeInsight = (btcData, ethData) => {
        const btcFlow = btcData.isPositive ? "净流入" : "净流出";
        const ethFlow = ethData.isPositive ? "净流入" : "净流出";
        const btcAmount = Math.abs(btcData.dailyInflow / 100000000).toFixed(2);
        const ethAmount = Math.abs(ethData.dailyInflow / 100000000).toFixed(2);
        const btcAssets = (btcData.totalAssets / 100000000000).toFixed(2); // 千亿美元
        const ethAssets = (ethData.totalAssets / 100000000000).toFixed(2);
        
        // 市场趋势深度分析
        let trendAnalysis = "";
        if (btcData.isPositive && ethData.isPositive) {
          const totalInflow = ((btcData.dailyInflow + ethData.dailyInflow) / 100000000).toFixed(2);
          trendAnalysis = `📈 市场呈现强势格局。BTC ETF ${btcFlow} ${btcAmount} 亿美元，ETH ETF ${ethFlow} ${ethAmount} 亿美元，合计流入 ${totalInflow} 亿美元。双币种同步吸金反映机构投资者风险偏好上升，这种资金共振效应通常预示着加密市场即将迎来新一轮上涨周期。`;
        } else if (!btcData.isPositive && !ethData.isPositive) {
          const totalOutflow = ((Math.abs(btcData.dailyInflow) + Math.abs(ethData.dailyInflow)) / 100000000).toFixed(2);
          trendAnalysis = `📉 市场情绪偏向谨慎。BTC ETF ${btcFlow} ${btcAmount} 亿美元，ETH ETF ${ethFlow} ${ethAmount} 亿美元，合计流出 ${totalOutflow} 亿美元。双币种同步撤资可能源于：1) 短期获利了结；2) 宏观风险事件影响；3) 技术面调整需求。建议关注支撑位有效性。`;
        } else {
          const dominant = btcData.isPositive ? "BTC" : "ETH";
          const weak = btcData.isPositive ? "ETH" : "BTC";
          trendAnalysis = `🔄 市场出现分化格局。${dominant} ETF 表现强势（${dominant === "BTC" ? btcFlow + " " + btcAmount : ethFlow + " " + ethAmount} 亿美元），而 ${weak} ETF 资金外流（${weak === "BTC" ? btcFlow + " " + btcAmount : ethFlow + " " + ethAmount} 亿美元）。这种差异化配置反映了机构投资者的精准选择，可能与各自生态发展、技术升级或估值水平有关。`;
        }
        
        // 规模与占比分析
        const scaleAnalysis = `💼 从资产规模看，BTC ETF 总资产达 ${btcAssets} 千亿美元（市值占比 ${btcData.marketRatio.toFixed(2)}%），ETH ETF 为 ${ethAssets} 千亿美元（占比 ${ethData.marketRatio.toFixed(2)}%）。BTC 的规模优势（${(btcData.totalAssets / ethData.totalAssets).toFixed(1)}x）体现其"数字黄金"地位，而 ETH 的占比提升空间暗示其增长潜力。`;
        
        // 技术面关联分析
        const technicalCorrelation = btcData.cumulativeInflow > 50000000000 ? 
          `累计净流入已超 ${(btcData.cumulativeInflow / 100000000).toFixed(0)} 亿美元，形成强大的资金池效应，为价格提供坚实支撑。` :
          `当前累计流入规模仍有提升空间，关注后续机构配置节奏。`;
        
        // 投资策略建议
        let strategy = "";
        const momentum = (btcData.dailyInflow + ethData.dailyInflow) / 100000000;
        if (momentum > 10) {
          strategy = `💡 策略建议：资金流入势头强劲（日均 ${momentum.toFixed(1)} 亿美元），市场处于机构建仓期。可考虑：1) 跟随机构资金布局主流币种；2) 关注ETF持仓变化寻找Alpha机会；3) 利用期权策略增强收益。注意控制仓位，避免追高。`;
        } else if (momentum < -10) {
          strategy = `💡 策略建议：资金流出压力明显（日均 ${Math.abs(momentum).toFixed(1)} 亿美元），短期需保持防御。建议：1) 降低杠杆敞口；2) 关注关键支撑位；3) 等待企稳信号再介入。记住：在恐慌中寻找机会，但不要接下落的刀。`;
        } else {
          strategy = `💡 策略建议：市场处于均衡状态，适合结构性机会挖掘。可关注：1) ETF溢价/折价套利；2) BTC/ETH配对交易；3) 波动率策略。保持灵活，随时调整仓位应对市场变化。`;
        }
        
        // 风险提示
        const riskAlert = `⚠️ 风险提示：加密资产波动性高，ETF资金流向仅是市场指标之一。需综合考虑：监管政策、宏观环境、技术发展等多重因素。理性投资，风险自担。`;
        
        return [trendAnalysis, scaleAnalysis, technicalCorrelation, strategy, riskAlert].join('\n\n');
      };
      
      // 更新主数据，使用Claude的AI解读
      const updatedData = {
        ...updatedRealData,
        getAIInsight: () => {
          // 使用Claude的动态AI解读
          return generateClaudeInsight(updatedRealData.btc, updatedRealData.eth);
        }
      };
      
      setData(updatedData);
      setUsingRealData(true);
      setLastUpdateTime(new Date());
      
      console.log('✅ 真实API数据已更新:', {
        btc: `${updatedRealData.btc.isPositive ? '流入' : '流出'} ${Math.abs(updatedRealData.btc.dailyInflow / 100000000).toFixed(2)}亿`,
        eth: `${updatedRealData.eth.isPositive ? '流入' : '流出'} ${Math.abs(updatedRealData.eth.dailyInflow / 100000000).toFixed(2)}亿`,
        updateTime: currentTime
      });
      
      const btcFlow = realETFData.btc.isPositive ? "净流入" : "净流出";
      const ethFlow = realETFData.eth.isPositive ? "净流入" : "净流出";
      const btcAmount = Math.abs(realETFData.btc.dailyInflow / 100000000).toFixed(2);
      const ethAmount = Math.abs(realETFData.eth.dailyInflow / 100000000).toFixed(2);
      
      console.log('✅ 真实数据加载成功');
      toast.success("🎯 真实数据已加载", {
        description: `BTC: ${btcAmount}亿 ${btcFlow}, ETH: ${ethAmount}亿 ${ethFlow}`,
      });
    } catch (error) {
      console.error('❌ 加载真实数据失败:', error);
      setUsingRealData(false);
      console.log('❌ 真实数据加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 并行加载真实数据和历史数据
      await Promise.all([
        loadRealData(),
        loadHistoryData()
      ]);
      
      setTimeout(() => {
        setIsLoading(false);
        toast.success("📊 数据已刷新", {
          description: "已加载最新 ETF 数据和历史记录",
        });
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast.error("❌ 刷新失败", {
        description: "请检查网络连接",
      });
    }
  };

  // 页面加载时获取真实数据和历史数据
  useEffect(() => {
    console.log('App组件已挂载，开始加载数据...');
    loadRealData(); // 加载真实ETF数据
    loadHistoryData(); // 加载历史数据
  }, []);

  // 自动刷新功能 - 每5分钟更新一次数据
  useEffect(() => {
    console.log('⏰ 设置5分钟自动刷新...');
    const interval = setInterval(() => {
      console.log('🔄 执行定时自动刷新...');
      loadRealData(); // 只刷新真实数据，历史数据不需要频繁更新
    }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000 毫秒

    // 清理函数
    return () => {
      console.log('🛑 清理自动刷新定时器...');
      clearInterval(interval);
    };
  }, []); // 空依赖数组，只在组件挂载时设置一次

  // 添加一个effect来监听historyData变化
  useEffect(() => {
    console.log('历史数据状态已更新:', historyData);
  }, [historyData]);


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600 shadow-2xl sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/30 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-lg sm:text-xl font-black text-white tracking-tighter">ETF</div>
                  <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-sans tracking-tight">
                  ETF Daily Mini Terminal
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 font-medium tracking-wide">
                  Professional Cryptocurrency ETF Analytics & Free AI Insights
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="flex flex-col items-center sm:items-end space-y-1">
                <Badge variant="outline" className="border-blue-400 text-blue-300 bg-blue-500/10 font-mono text-base hidden sm:block">
                  <div className="flex flex-col items-center">
                    <div>📡 API Data Updated:</div>
                    <div className="mt-1">{data.updateTime}</div>
                  </div>
                </Badge>
                <Badge variant="outline" className="border-blue-400 text-blue-300 bg-blue-500/10 font-mono text-sm sm:hidden">
                  📡 {data.updateTime.split(' ')[1]}
                </Badge>
              </div>
              <Button 
                onClick={() => window.open('https://sosovalue.com/assets/etf/us-btc-spot', '_blank')} 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/25"
              >
                <Database className="w-5 h-5 mr-2" />
                Data Source
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Status Bar */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border border-slate-600 rounded-xl p-2 sm:p-4 md:p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-base sm:text-lg font-medium gap-3 sm:gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4 md:space-x-6">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${usingRealData ? "bg-green-500/20 border border-green-500/40" : "bg-amber-500/20 border border-amber-500/40"}`}>
                <div className={`w-2 h-2 rounded-full ${usingRealData ? "bg-green-400" : "bg-amber-400"} animate-pulse`}></div>
                <span className={usingRealData ? "text-green-300" : "text-amber-300"}>
                  {usingRealData ? "Live Data" : "API Ready"}
                </span>
              </div>
              <a href="https://sosovalue.gitbook.io/soso-value-api-doc" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-105">
                📋 SoSoValue API
              </a>
              <a href="https://x.com/porounclemao" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-400 transition-all duration-300 hover:scale-105 hidden sm:inline">
                👨‍💻 Developer
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Database className={`w-5 h-5 ${usingRealData ? "text-green-400" : "text-amber-400"}`} />
              <span className={`font-semibold ${usingRealData ? "text-green-300" : "text-amber-300"}`}>
                {usingRealData ? "Real-time Analytics" : "Demo Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* ETF 最新数据区 */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <h2 className="text-lg sm:text-xl font-bold text-green-400 font-mono">实时数据监控</h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={refreshData}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className={`border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 transition-all duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新数据
              </Button>
              <Badge variant="outline" className="border-gray-600 text-gray-300 text-sm sm:text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                STREAMING
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ETFDataCard 
              symbol="BTC" 
              name="比特币现货 ETF"
              data={data.btc}
              date={data.date}
            />
            <ETFDataCard 
              symbol="ETH" 
              name="以太坊现货 ETF"
              data={data.eth}
              date={data.date}
            />
          </div>
        </section>

        {/* Latest Data Section - Broadcast Text */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400" />
            <h2 className="text-lg sm:text-xl font-bold text-green-400 font-mono">最新播报</h2>
          </div>
          
          <CodeBlock
            title="📊 每日 ETF 数据日报一键生成，欢迎复制至你的群组和社交网络"
            content={broadcastText}
            onCopy={handleCopyBroadcast}
          />
        </section>

        {/* AI Insight Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-blue-400 font-mono">AI 智能解读</h2>
            <Badge variant="outline" className="border-blue-500 text-blue-400 text-sm sm:text-xs font-mono">
              GPT-5 就绪
            </Badge>
          </div>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <CardTitle className="text-blue-400 text-xl font-mono">AI 解读来自多个 AI 的综合解读，观点仅供参考</CardTitle>
                </div>
                <Button
                  onClick={handleCopyAI}
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-400 h-12 px-6 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <Send className="w-6 h-6 mr-3" />
                  一键分享
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors duration-200 relative group" onClick={handleCopyAI}>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Copy className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line pr-4 sm:pr-8">
                  {(() => {
                    try {
                      return data.getAIInsight();
                    } catch (error) {
                      console.error('AI解读渲染失败:', error);
                      return 'AI 解读加载中...';
                    }
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Historical Logs Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            <h2 className="text-lg sm:text-xl font-bold text-orange-400 font-mono">ETF 历史数据</h2>
          </div>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-6 h-6 text-orange-400" />
                  <CardTitle className="text-orange-400 text-xl font-mono">过去 30 日的历史记录</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 sm:px-6 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <TabsList className="bg-gray-800 border border-gray-700">
                    <TabsTrigger 
                      value="btc" 
                      className="data-[state=active]:bg-gray-700 data-[state=active]:text-orange-400 font-mono text-base sm:text-lg"
                    >
                      BTC记录.log
                    </TabsTrigger>
                    <TabsTrigger 
                      value="eth"
                      className="data-[state=active]:bg-gray-700 data-[state=active]:text-orange-400 font-mono text-base sm:text-lg"
                    >
                      ETH记录.log
                    </TabsTrigger>
                  </TabsList>
                  
                  <a 
                    href={activeTab === 'btc' 
                      ? "https://sosovalue.com/assets/etf/Total_Crypto_Spot_ETF_Fund_Flow?page=usBTC"
                      : "https://sosovalue.com/assets/etf/Total_Crypto_ETH_ETF_Fund_Flow?page=usETH"
                    } 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 transition-colors text-sm font-mono"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>更多图表</span>
                  </a>
                </div>
                
                <TabsContent value="btc" className="mt-4">
                  <div className="bg-black mx-6 mb-6 border border-gray-700 rounded-lg max-h-80 overflow-y-auto">
                    {historyData.btc.map((item, index) => (
                      <HistoryRow key={index} item={item} symbol="BTC" />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="eth" className="mt-4">
                  <div className="bg-black mx-6 mb-6 border border-gray-700 rounded-lg max-h-80 overflow-y-auto">
                    {historyData.eth.map((item, index) => (
                      <HistoryRow key={index} item={item} symbol="ETH" />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 sm:py-6 text-gray-500 border-t border-gray-800">
          <div className="font-mono text-base sm:text-sm space-y-2 sm:space-y-1">
            <p>$ 数据来源: SoSoValue API | 推送时间: {data.updateTime}</p>
            <p className="text-sm sm:text-xs">🤖 技术支持: RPCGPT 终端 | 构建于: React + Tailwind</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;