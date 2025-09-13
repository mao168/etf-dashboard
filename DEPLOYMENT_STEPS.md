# ETF Daily Mini Terminal - 完整部署指南

## 🚀 快速部署步骤

### 第一步：Netlify 前端部署

1. **登录 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用你的账户登录

2. **导入 GitHub 项目**
   - 点击 "New site from Git"
   - 选择 "GitHub" 
   - 找到并选择 `etf-dashboard` 仓库

3. **配置构建设置** (自动识别)
   - Build command: `npm run build` ✅
   - Publish directory: `dist` ✅  
   - Node version: `18` ✅
   - *(项目已包含 netlify.toml，会自动配置)*

4. **部署前端**
   - 点击 "Deploy site"
   - 等待构建完成 (约2-3分钟)
   - 获得临时域名: `https://random-name-123.netlify.app`

### 第二步：Railway 后端部署

1. **注册并登录 Railway**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账户登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 找到并选择 `etf-dashboard` 仓库

3. **配置部署设置**
   - Root Directory: 保持为 `/` (项目根目录)
   - Start Command: `cd backend && npm start`
   - *(项目已包含 railway.json 配置)*

4. **配置环境变量**
   在 Railway 项目设置中添加：
   ```
   SOSO_API_KEY=your_soso_api_key
   SOSO_BASE_URL=https://api.sosovalue.xyz
   PORT=3001
   NODE_ENV=production
   CACHE_TTL=300
   FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```

5. **部署后端**
   - Railway 会自动部署
   - 获得后端域名: `https://your-app.railway.app`

### 第三步：连接前后端

1. **更新 Netlify 环境变量**
   - 在 Netlify Site Settings > Environment variables 中添加：
   ```
   VITE_API_BASE_URL=https://your-app.railway.app/api
   ```

2. **更新 Railway CORS 配置**
   - 在 Railway 环境变量中更新：
   ```
   FRONTEND_URL=https://your-actual-netlify-domain.netlify.app
   ```

3. **重新部署**
   - Netlify: 触发重新构建
   - Railway: 自动重新部署

## 📋 需要准备的信息

### SoSoValue API 密钥
- 访问 [SoSoValue API 文档](https://sosovalue.gitbook.io/soso-value-api-doc)
- 注册并获取 API 密钥
- 将密钥添加到 Railway 环境变量中

### 域名 (可选)
- 如果你有自定义域名，可以在 Netlify 中配置
- 记得同时更新 Railway 的 FRONTEND_URL

## ✅ 部署完成检查清单

- [ ] Netlify 前端部署成功
- [ ] Railway 后端部署成功  
- [ ] 环境变量配置正确
- [ ] API 密钥有效
- [ ] 前后端连接正常
- [ ] 数据加载正常
- [ ] CORS 配置正确

## 🐛 故障排除

### 前端问题
- **构建失败**: 检查 Node.js 版本 (需要 >= 18)
- **页面空白**: 检查 VITE_API_BASE_URL 环境变量
- **API 调用失败**: 检查后端 URL 是否正确

### 后端问题  
- **部署失败**: 检查 package.json 中的启动命令
- **API 错误**: 检查 SOSO_API_KEY 是否有效
- **CORS 错误**: 检查 FRONTEND_URL 是否匹配 Netlify 域名

### 连接问题
- **数据不显示**: 检查网络面板中的 API 请求状态
- **跨域错误**: 确保后端 CORS 配置包含正确的前端域名

## 🔄 更新部署

### 代码更新
1. 推送代码到 GitHub
2. Netlify 和 Railway 会自动重新部署

### 环境变量更新
1. 在相应平台的设置页面更新
2. 触发重新部署生效

---

**技术栈**: React + Vite + Tailwind CSS + Node.js + Express
**数据源**: SoSoValue API
**部署平台**: Netlify (前端) + Railway (后端)