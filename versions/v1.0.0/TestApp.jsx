import React from 'react';

const TestApp = () => {
  return (
    <div style={{backgroundColor: 'black', color: 'white', padding: '20px', minHeight: '100vh'}}>
      <h1 style={{fontSize: '48px', textAlign: 'center'}}>🎯 测试页面</h1>
      <p style={{fontSize: '24px', textAlign: 'center', marginTop: '16px'}}>如果您看到此页面，说明React正常工作</p>
      <div style={{textAlign: 'center', marginTop: '32px'}}>
        <div style={{fontSize: '96px'}}>✅</div>
        <p style={{fontSize: '20px', marginTop: '16px'}}>前端服务正常运行</p>
      </div>
    </div>
  );
};

export default TestApp;