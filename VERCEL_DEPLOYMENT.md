# Vercel 后端部署指南

## 已完成的配置

✅ **Vercel API 函数已创建:**
- `api/health.js` - 健康检查端点
- `api/etf/current.js` - ETF数据API端点  
- `vercel.json` - Vercel部署配置
- 添加了axios依赖到package.json

## 手动部署步骤

### 1. 登录Vercel
```bash
npx vercel login
```

### 2. 部署项目
```bash
npx vercel --prod --yes
```

### 3. 配置环境变量
在Vercel控制台中设置以下环境变量：

```
SOSO_API_KEY=SOSO-a929b0c0a07e40bf80e2f424cd45110f
SOSO_BASE_URL=https://api.sosovalue.xyz
NODE_ENV=production
```

### 4. 验证部署
部署完成后，您的API将可在以下地址访问：
- 健康检查: https://your-project.vercel.app/api/health
- ETF数据: https://your-project.vercel.app/api/etf/current

### 5. 更新前端配置
将Vercel API URL添加到Netlify环境变量：
```
VITE_API_BASE_URL=https://your-project.vercel.app/api
```

## 替代方案：通过GitHub集成部署

1. 访问 [Vercel控制台](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择您的GitHub仓库 `etf-dashboard`
4. Vercel会自动检测配置并部署
5. 在项目设置中添加环境变量

## 注意事项

- Vercel serverless函数有10秒超时限制
- 每月有免费额度限制
- API响应会自动缓存以提高性能

部署完成后，请更新 `.env.production` 文件中的API URL并重新构建Netlify前端。