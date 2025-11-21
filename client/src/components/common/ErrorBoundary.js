import React, { Component } from 'react';
import { Button, Result } from 'antd';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <Result
                        status="error"
                        title="Đã có lỗi xảy ra"
                        subTitle="Xin lỗi, có điều gì đó không đúng. Vui lòng thử lại."
                        extra={
                            <Button type="primary" onClick={this.handleReset}>
                                Về trang chủ
                            </Button>
                        }
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
