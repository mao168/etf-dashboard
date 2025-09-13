import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Terminal, Activity, Database, Clock, TrendingUp, TrendingDown, Bot, Zap, DollarSign, Target, Wallet, Radio, FileText, Share, MessageCircle, Sparkles, Send, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

// API 配置 - 后端服务API
const API_CONFIG = {
  baseURL: 'http://localhost:3001/api', // 本地后端API
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

// 获取ETF历史数据 - 简化版本，仅返回mock数据
const fetchETFHistoryData = async () => {
  try {
    console.log('📋 生成历史数据...');
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API延迟
    
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

  return `🐱 每日 ETF 数据播报

📅 日期：${data.date}  
📊 数据类型：US BTC & ETH Spot ETF  
${btcEmoji} BTC ETF 今日为：${btcFlow} ${formatToYi(Math.abs(data.btc.dailyInflow))} USD ${btcTrend}  
${ethEmoji} ETH ETF 今日为：${ethFlow} ${formatToYi(Math.abs(data.eth.dailyInflow))} USD ${ethTrend}  

数据来源：SoSoValue  
推送时间：${data.updateTime}`;
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
              <CardTitle className="text-3xl sm:text-2xl font-bold text-gray-100 font-mono">{symbol} ETF</CardTitle>
              <CardDescription className="text-gray-500 font-mono text-lg sm:text-base">{name}</CardDescription>
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
        <div className="p-3 sm:p-4 md:p-5 bg-black border border-gray-700 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-gray-500 text-lg sm:text-base font-mono mb-1">📈 今日净流向:</p>
              <p className={`text-4xl sm:text-3xl font-bold font-tabular-nums ${trendColor} font-mono`}>
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
        <div className="bg-black border border-gray-700 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-2">
          <div className="flex items-center justify-between py-2 sm:py-1.5">
            <span className="text-gray-500 text-lg sm:text-base font-mono">🏦 总资产净值:</span>
            <span className="text-gray-300 font-mono text-xl sm:text-lg font-tabular-nums">{formatToYi(data.totalAssets)} USD</span>
          </div>
          
          <div className="flex items-center justify-between py-2 sm:py-1.5 border-t border-gray-800">
            <span className="text-gray-500 text-lg sm:text-base font-mono">📊 市值占比:</span>
            <span className="text-gray-300 font-mono text-xl sm:text-lg font-tabular-nums">{data.marketRatio}%</span>
          </div>
          
          <div className="flex items-center justify-between py-2 sm:py-1.5 border-t border-gray-800">
            <span className="text-gray-500 text-lg sm:text-base font-mono">💰 累计净流入:</span>
            <span className="text-gray-300 font-mono text-xl sm:text-lg font-tabular-nums">{formatToYi(data.cumulativeInflow)} USD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 主应用组件
const App = () => {
  const [data, setData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('btc');
  const [historyData, setHistoryData] = useState(mockData.history);
  const [usingRealData, setUsingRealData] = useState(true);

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
      const newHistoryData = await fetchETFHistoryData();
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
          description: `模拟数据：过去30日记录 (BTC: ${newHistoryData.btc.length}条, ETH: ${newHistoryData.eth.length}条)`,
        });
      } else {
        console.log('⚠️  API数据格式不正确，使用备用数据');
        setHistoryData(mockData.history);
        toast.info("📊 使用静态数据", {
          description: "API端点不可用，显示静态模拟数据",
        });
      }
    } catch (error) {
      console.error('❌ 加载历史数据失败:', error);
      setHistoryData(mockData.history);
      toast.error("❌ 数据加载失败", {
        description: "使用备用数据显示",
      });
    }
  };

  const loadRealData = async () => {
    try {
      console.log('🚀 开始加载真实ETF数据...');
      const realETFData = await fetchRealETFData();
      
      // 更新主数据，使用后端提供的AI解读
      const updatedData = {
        ...realETFData,
        getAIInsight: () => {
          // 如果后端提供了AI解读，直接使用
          if (realETFData.aiInsight) {
            return realETFData.aiInsight;
          }
          
          // 兜底：使用原有的AI解读逻辑
          const btcFlow = realETFData.btc.isPositive ? "净流入" : "净流出";
          const ethFlow = realETFData.eth.isPositive ? "净流入" : "净流出";
          const btcAmount = Math.abs(realETFData.btc.dailyInflow / 100000000).toFixed(2);
          const ethAmount = Math.abs(realETFData.eth.dailyInflow / 100000000).toFixed(2);
          
          const paragraphs = [
            `今日 BTC ETF ${btcFlow} ${btcAmount} 亿美元，ETH ETF ${ethFlow} ${ethAmount} 亿美元。BTC ETF 总资产净值达 ${(realETFData.btc.totalAssets / 100000000).toFixed(0)} 亿美元，市值占比 ${realETFData.btc.marketRatio.toFixed(2)}%，显示机构资金持续关注。`,
            `ETH ETF 总资产净值 ${(realETFData.eth.totalAssets / 100000000).toFixed(0)} 亿美元，市值占比 ${realETFData.eth.marketRatio.toFixed(2)}%。两类 ETF 的资金流向反映了当前市场对加密货币的投资情绪和机构配置策略。`,
            `数据来源: SoSoValue API | 更新时间: ${realETFData.updateTime}`
          ];
          return paragraphs.join('\n\n');
        }
      };
      
      setData(updatedData);
      setUsingRealData(true);
      
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
      toast.error("❌ 真实数据加载失败", {
        description: "继续使用模拟数据",
      });
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

  // 添加一个effect来监听historyData变化
  useEffect(() => {
    console.log('历史数据状态已更新:', historyData);
  }, [historyData]);


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600 shadow-2xl sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/30 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-lg sm:text-xl font-black text-white tracking-tighter">ETF</div>
                  <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-sans tracking-tight">
                  ETF Data Terminal
                </h1>
                <p className="text-sm sm:text-lg text-gray-300 font-medium tracking-wide">
                  Professional Cryptocurrency ETF Analytics & AI Insights
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="flex flex-col items-center sm:items-end space-y-1">
                <Badge variant="outline" className="border-blue-400 text-blue-300 bg-blue-500/10 font-mono text-base hidden sm:block">
                  <div className="flex flex-col items-center">
                    <div>🕐 Last Updated:</div>
                    <div className="mt-1">{data.updateTime}</div>
                  </div>
                </Badge>
                <Badge variant="outline" className="border-blue-400 text-blue-300 bg-blue-500/10 font-mono text-sm sm:hidden">
                  🕐 {data.updateTime.split(' ')[1]}
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Status Bar */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border border-slate-600 rounded-xl p-3 sm:p-4 md:p-5 shadow-2xl">
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
              <h2 className="text-xl sm:text-2xl font-bold text-green-400 font-mono">实时数据监控</h2>
            </div>
            <Badge variant="outline" className="border-gray-600 text-gray-300 text-sm sm:text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
              STREAMING
            </Badge>
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
            <h2 className="text-xl sm:text-2xl font-bold text-green-400 font-mono">最新播报</h2>
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
            <h2 className="text-xl sm:text-2xl font-bold text-blue-400 font-mono">AI 智能解读</h2>
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
                <p className="text-gray-300 leading-loose text-xl whitespace-pre-line pr-8">
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
            <h2 className="text-xl sm:text-2xl font-bold text-orange-400 font-mono">ETF 历史数据</h2>
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