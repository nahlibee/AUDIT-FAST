import React, { Component } from 'react';

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in its child component tree.
 * It logs errors and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  /**
   * Update state when errors are caught
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log detailed information about caught errors
   */
  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You could also send this to an error reporting service like Sentry
  }

  /**
   * Reset error state to allow retry
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-md my-4">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Une erreur s'est produite
          </h2>
          <p className="mb-4 text-red-600">
            {this.props.fallbackMessage || "Quelque chose s'est mal passé lors du chargement de ce composant."}
          </p>
          
          {/* Show error details in development only */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-2 bg-white rounded">
              <summary className="cursor-pointer text-gray-700 font-medium">
                Détails techniques (développement uniquement)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-xs">
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={this.handleReset}
            >
              Réessayer
            </button>
            
            {this.props.onReset && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  this.handleReset();
                  this.props.onReset();
                }}
              >
                Recharger les données
              </button>
            )}
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 