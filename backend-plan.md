# ETF Dashboard 后端实现方案

## 🎯 推荐方案：Node.js + Express 后端服务

### 📋 技术栈选择
- **Backend**: Node.js + Express
- **数据库**: SQLite/PostgreSQL (存储历史数据)
- **缓存**: Redis (可选，提升性能)  
- **定时任务**: node-cron
- **部署**: Vercel/Railway/DigitalOcean

### 🏗️ 架构设计

#### 1. API代理服务
```
Frontend → Your Backend API → SoSoValue API
```
- 隐藏API密钥
- 解决CORS问题
- 统一错误处理
- 请求频率控制

#### 2. 数据更新策略

**手动触发更新**：
- `/api/refresh` 端点
- 前端按钮触发
- 管理后台触发

**自动定时更新**：
- 每5分钟检查数据更新
- 美股交易时间频繁更新
- 非交易时间降低频率

#### 3. 数据存储策略
- **实时数据**: 内存缓存 (5分钟有效)
- **历史数据**: 数据库持久化
- **备份机制**: 每日备份关键数据

### 📁 项目结构
```
etf-dashboard/
├── frontend/          # React前端
├── backend/           # Node.js后端
│   ├── routes/        # API路由
│   ├── services/      # SoSoValue API服务
│   ├── models/        # 数据模型
│   ├── middleware/    # 中间件
│   └── tasks/         # 定时任务
└── README.md
```

### 🔄 核心功能实现

#### 1. SoSoValue API集成服务
```javascript
// backend/services/sosovalue.js
class SoSoValueService {
  async fetchCurrentData(type) {
    // 调用SoSoValue API
    // 数据转换和验证
    // 缓存机制
  }
  
  async getHistoricalData(symbol, days) {
    // 获取历史数据
    // 数据库查询和缓存
  }
}
```

#### 2. 定时任务系统
```javascript
// backend/tasks/scheduler.js  
cron.schedule('*/5 * * * *', async () => {
  // 每5分钟更新数据
  await updateETFData();
});
```

#### 3. WebSocket实时推送 (可选)
```javascript
// 实时数据推送到前端
io.emit('etf-data-update', newData);
```

### 🚀 部署和运维

#### 环境变量配置
```env
SOSO_API_KEY=SOSO-a929b0c0a07e40bf80e2f424cd45110f
SOSO_BASE_URL=https://api.sosovalue.xyz
PORT=3001
NODE_ENV=production
DATABASE_URL=...
```

#### 健康检查和监控
- `/health` 健康检查端点
- API调用日志记录
- 错误监控和告警
- 性能指标收集

### 💡 实施建议

**Phase 1: 基础后端 (1-2天)**
1. 创建Express服务器
2. 实现SoSoValue API代理
3. 基础数据缓存
4. 前端对接

**Phase 2: 数据持久化 (1天)**  
1. 数据库设计和初始化
2. 历史数据存储
3. 数据查询优化

**Phase 3: 自动化和监控 (1天)**
1. 定时任务实现
2. 错误处理完善
3. 监控和日志系统

### 🔍 其他考虑

**安全性**:
- API密钥安全存储
- 请求频率限制
- 输入验证和清理

**性能优化**:
- 响应缓存机制
- 数据压缩
- CDN集成

**可扩展性**:
- 支持多个数据源
- 微服务架构预留
- 横向扩展能力