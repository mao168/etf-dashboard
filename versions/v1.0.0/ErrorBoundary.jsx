import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{backgroundColor: 'black', color: 'white', padding: '20px', minHeight: '100vh'}}>
          <h1 style={{fontSize: '48px', color: 'red'}}>⚠️ 页面加载错误</h1>
          <details style={{whiteSpace: 'pre-wrap', marginTop: '20px', fontSize: '14px'}}>
            <summary>错误详情</summary>
            <p><strong>错误:</strong> {this.state.error && this.state.error.toString()}</p>
            <p><strong>错误堆栈:</strong></p>
            <pre>{this.state.errorInfo?.componentStack || '无法获取组件堆栈信息'}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;