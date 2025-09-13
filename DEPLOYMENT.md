# ETF Dashboard 部署指南

## 项目概述
ETF Dashboard 是一个实时显示BTC和ETH ETF资金流向的仪表板应用。

## 部署架构
- **前端**: React + Vite + Tailwind CSS (部署到Netlify)
- **后端**: Node.js + Express (需要单独部署)

## 部署步骤

### 1. GitHub 仓库设置
1. 在GitHub创建新仓库 `etf-dashboard`
2. 推送代码到GitHub

### 2. Netlify 部署 (前端)
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 GitHub 并连接仓库
4. 配置构建设置:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### 3. 环境变量配置
在Netlify Site Settings > Environment variables 中添加:
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### 4. 后端部署选项

#### 选项A: Railway (推荐)
1. 访问 [Railway](https://railway.app)
2. 从GitHub导入后端代码
3. 设置环境变量:
   ```
   SOSO_API_KEY=your_soso_api_key
   SOSO_BASE_URL=https://api.sosovalue.xyz
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```

#### 选项B: Render
1. 访问 [Render](https://render.com)
2. 创建新的Web Service
3. 连接GitHub仓库，选择backend文件夹

#### 选项C: Vercel
1. 使用Vercel Functions部署后端API

### 5. 域名配置 (可选)
1. 购买域名 (推荐: Namecheap, GoDaddy)
2. 在Netlify中添加自定义域名
3. 配置DNS设置

## 本地开发
```bash
# 前端
npm install
npm run dev

# 后端
cd backend
npm install
npm run dev
```

## 构建命令
```bash
# 前端构建
npm run build

# 后端启动
cd backend
npm start
```

## 注意事项
1. SoSoValue API密钥需要单独申请
2. 确保CORS配置正确
3. 生产环境需要HTTPS
4. 定期检查API限制和使用量

## 故障排除
- 如果API调用失败，检查CORS和API密钥
- 如果构建失败，确认Node.js版本兼容性
- 如果样式异常，检查Tailwind CSS配置