import React from 'react';
import logo from '../assets/logo.png';

const isDevelopment = import.meta.env.DEV;

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-8 bg-black">
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-transparent to-pink-900/20" />
          </div>

          <div className="relative z-10 w-full max-w-2xl mt-28 md:mt-32">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-black/50">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Logo" className="w-20 md:w-24 drop-shadow-2xl" />
              </div>

              {/* Error Badge */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-sm font-semibold text-red-300">
                  <span className="text-lg">⚠️</span>
                  {" "}
                  Oops! Something went wrong
                </span>
              </div>

              {/* Error Message */}
              <h2 className="text-center text-lg md:text-2xl font-bold text-white tracking-wide mb-4">
                Application Error
              </h2>

              <div className="space-y-4 mb-6">
                <p className="text-center text-white/80">
                  We encountered an unexpected error. Our team has been notified and we're working on a fix.
                </p>

                {/* Error Details (Development Only) */}
                {isDevelopment && this.state.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-red-300 font-mono text-xs wrap-break-word">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2 text-red-200 text-xs">
                        <summary className="cursor-pointer font-semibold">Stack Trace</summary>
                        <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Error Count */}
                {this.state.errorCount > 2 && (
                  <p className="text-center text-yellow-300 text-sm">
                    Multiple errors detected ({this.state.errorCount}). 
                    {this.state.errorCount > 5 && " Please refresh the page."}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={this.resetError}
                  className="flex-1 px-5 py-3 bg-white/20 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Go Home
                </button>
              </div>

              {/* Help Text */}
              <p className="text-center text-white/50 text-xs mt-4">
                If the problem persists, please contact support at support@connecta.com
              </p>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

