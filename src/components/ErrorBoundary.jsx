import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        ⚠️ Something went wrong in this section.
                    </h2>
                    <p className="font-medium">Error: {this.state.error && this.state.error.toString()}</p>
                    <details className="whitespace-pre-wrap text-sm bg-red-100 p-4 rounded overflow-auto max-h-48 text-red-800">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
