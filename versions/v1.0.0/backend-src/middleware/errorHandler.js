// 404 处理中间件
export const notFound = (req, res, next) => {
  const error = new Error(`🔍 Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 错误处理中间件
export const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message;

  // Mongoose bad ObjectId
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    timestamp: new Date().toISOString()
  });
};