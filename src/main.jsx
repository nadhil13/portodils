// src/main.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Preloader from './components/Preloader.jsx';
import './index.css';

// Error Boundary Component yang lebih robust
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // Khusus untuk Three.js geometry errors
    if (error.message && error.message.includes('geometry')) {
      console.log('Three.js geometry error detected, attempting recovery...');
      // Coba reload setelah delay singkat
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060010] flex items-center justify-center text-white p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-cyan-400">Oops! Something went wrong.</h1>
            <p className="text-gray-400 mb-6">Terjadi kesalahan saat memuat aplikasi. Silakan coba refresh halaman.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors font-semibold"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details (Dev Only)</summary>
                <pre className="text-xs text-red-400 mt-2 bg-black/50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Komponen wrapper utama yang mengelola status pemuatan
 * dan beralih antara Preloader dan aplikasi utama.
 */
const Main = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fungsi callback yang akan dipanggil oleh Preloader saat animasinya selesai
  const handlePreloaderFinished = () => {
    console.log('Preloader finished, loading main app...');
    setIsLoading(false);
  };

  // Fallback jika ada error
  const handleError = (error) => {
    console.error('Main component error:', error);
    setErrorMessage(error?.message || 'Unknown error occurred');
    setHasError(true);
    setIsLoading(false);
  };

  // Timeout untuk memastikan aplikasi tidak stuck di preloader
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Main component timeout, forcing app load');
        setIsLoading(false);
      }
    }, 10000); // 10 detik maksimal

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Error handling untuk unhandled errors
  useEffect(() => {
    const handleUnhandledError = (event) => {
      console.error('Unhandled error:', event.error);
      
      // Khusus untuk Three.js geometry errors
      if (event.error && event.error.message && event.error.message.includes('geometry')) {
        console.log('Three.js geometry error detected, attempting recovery...');
        event.preventDefault(); // Prevent default error handling
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }
      
      handleError(event.error);
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Khusus untuk Three.js geometry errors dalam promise
      if (event.reason && event.reason.message && event.reason.message.includes('geometry')) {
        console.log('Three.js geometry error in promise detected, attempting recovery...');
        event.preventDefault(); // Prevent default error handling
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }
      
      handleError(new Error(event.reason));
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#060010] flex items-center justify-center text-white p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-cyan-400">Loading Error</h1>
          <p className="text-gray-400 mb-6">Gagal memuat aplikasi. Silakan coba lagi.</p>
          {errorMessage && (
            <p className="text-sm text-red-400 mb-4">{errorMessage}</p>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors font-semibold"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Preloader onFinished={handlePreloaderFinished} />
      ) : (
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      )}
    </>
  );
};

// Wrapper untuk menangani error saat render
const AppWrapper = () => {
  try {
    return (
      // Sementara nonaktifkan StrictMode untuk debugging
      <ErrorBoundary>
        <Main />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Critical error during render:', error);
    return (
      <div className="min-h-screen bg-[#060010] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Critical Error</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

// Render komponen Main ke dalam DOM dengan error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWrapper />);
