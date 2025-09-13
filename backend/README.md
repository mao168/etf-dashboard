# ETF Dashboard Backend

🚀 Node.js 后端服务，为ETF数据终端提供API支持

## 🌟 功能特性

- ✅ SoSoValue API集成和代理
- ✅ 自动数据缓存机制
- ✅ 定时数据更新任务
- ✅ SQLite数据持久化
- ✅ RESTful API设计
- ✅ 健康检查端点
- ✅ 错误处理和日志

## 🛠️ 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite
- **HTTP Client**: Axios
- **Task Scheduler**: node-cron
- **Security**: Helmet + CORS

## 📋 API端点

### 核心数据API
- `GET /api/etf/current` - 获取当前ETF数据
- `POST /api/etf/refresh` - 手动刷新数据
- `GET /api/etf/history` - 获取历史数据
- `GET /api/etf/status` - API状态检查

### 系统API
- `GET /api/health` - 基础健康检查
- `GET /api/health/detailed` - 详细系统状态

## 🚀 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **环境配置**
   ```bash
   cp .env.example .env
   # 编辑.env文件，设置你的SoSoValue API密钥
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问API**
   - 服务器: http://localhost:3001
   - 健康检查: http://localhost:3001/api/health
   - ETF数据: http://localhost:3001/api/etf/current

### 部署到Vercel

1. **创建Vercel账户**: https://vercel.com
2. **安装Vercel CLI**: `npm i -g vercel`
3. **部署项目**:
   ```bash
   vercel
   ```
4. **设置环境变量** (在Vercel控制台):
   - `SOSO_API_KEY`: 你的SoSoValue API密钥
   - `NODE_ENV`: production

## 📁 项目结构

```
backend/
├── src/
│   ├── config/         # 配置文件 (数据库等)
│   ├── middleware/     # Express中间件
│   ├── routes/         # API路由
│   ├── services/       # 业务逻辑服务
│   ├── tasks/          # 定时任务
│   └── server.js       # 主服务器文件
├── data/               # SQLite数据库
├── .env                # 环境变量 (不上传到git)
├── .env.example        # 环境变量示例
├── package.json
├── vercel.json         # Vercel部署配置
└── README.md
```

## ⚙️ 配置说明

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| SOSO_API_KEY | SoSoValue API密钥 | 必填 |
| SOSO_BASE_URL | SoSoValue API地址 | https://api.sosovalue.xyz |
| PORT | 服务器端口 | 3001 |
| NODE_ENV | 运行环境 | development |
| CACHE_TTL | 缓存时长(秒) | 300 |
| DATA_UPDATE_INTERVAL | 数据更新间隔(分钟) | 5 |

### 自动任务

- **数据更新**: 每5分钟自动获取最新ETF数据
- **高频更新**: 美股交易时间每2分钟更新
- **缓存清理**: 每天6点清理过期缓存

## 📊 数据流程

1. **实时数据**: SoSoValue API → 缓存 → 前端
2. **历史数据**: 定时任务 → 数据库 → API响应
3. **缓存机制**: 5分钟内重复请求直接返回缓存

## 🔧 故障排除

### 常见问题

**Q: API返回401错误**
A: 检查SOSO_API_KEY是否正确设置

**Q: 数据更新不及时**
A: 检查定时任务状态: `GET /api/etf/status`

**Q: 部署后无法访问**
A: 确认Vercel环境变量已正确设置

### 日志调试

开发环境会显示详细日志，生产环境仅显示关键信息。

## 📈 性能优化

- ✅ 响应缓存机制
- ✅ 数据库连接池
- ✅ GZIP压缩
- ✅ 请求频率限制

## 🔐 安全特性

- ✅ API密钥服务器端保护
- ✅ CORS跨域安全配置
- ✅ 请求头安全增强
- ✅ 输入验证和清理

## 📝 开发计划

- [ ] Redis缓存集成
- [ ] WebSocket实时推送
- [ ] API速率限制
- [ ] 更多数据源集成
- [ ] 监控和告警系统

## 🤝 贡献

欢迎提交Issues和Pull Requests!

## 📄 许可证

MIT License