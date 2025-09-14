# Railway环境变量配置指南

## 必需的环境变量

请在Railway项目中设置以下环境变量：

### 1. API配置
```
SOSO_API_KEY=SOSO-a929b0c0a07e40bf80e2f424cd45110f
SOSO_BASE_URL=https://api.sosovalue.xyz
```

### 2. 服务器配置
```
PORT=3001
NODE_ENV=production
```

### 3. 数据库配置
```
DATABASE_PATH=./data/etf-dashboard.db
```

### 4. 缓存配置
```
CACHE_TTL=300
DATA_UPDATE_INTERVAL=5
```

### 5. CORS配置
```
FRONTEND_URL=https://willowy-liger-368723.netlify.app
```

## 设置步骤

1. 登录Railway控制台: https://railway.app
2. 选择您的项目 `etf-dashboard`
3. 点击 "Variables" 标签
4. 点击 "Add Variable" 按钮
5. 逐个添加上述环境变量
6. 保存后，Railway会自动重新部署

## 验证部署

部署完成后，访问以下端点验证：
- 健康检查: https://etf-dashboard-production.up.railway.app/api/health
- ETF数据: https://etf-dashboard-production.up.railway.app/api/etf/current

## Netlify前端配置

在Netlify中添加环境变量：
```
VITE_API_BASE_URL=https://etf-dashboard-production.up.railway.app/api
```

设置步骤：
1. 登录Netlify
2. 选择您的项目
3. 进入 Site settings > Environment variables
4. 添加上述变量
5. 重新部署前端