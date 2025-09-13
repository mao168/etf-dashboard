// 异步处理中间件 - 自动捕获 async/await 错误
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};