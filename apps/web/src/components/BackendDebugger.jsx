import React, { useState, useEffect } from 'react';
import { testBackendConnection } from '../utils/testConnection';

const BackendDebugger = () => {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    // Get environment variables for debugging
    setEnvVars({
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_PAYMENT_API_URL: import.meta.env.VITE_PAYMENT_API_URL,
      VITE_APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT,
    });
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await testBackendConnection();
      setConnectionStatus(result ? 'connected' : 'failed');
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected';
      case 'failed': return '❌ Connection Failed';
      case 'error': return '❌ Error';
      default: return '❓ Unknown';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Backend Connection Debugger</h3>
      
      <div className="space-y-4">
        {/* Environment Variables */}
        <div>
          <h4 className="font-medium mb-2">Environment Variables:</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <div><strong>VITE_API_BASE_URL:</strong> {envVars.VITE_API_BASE_URL || 'Not set'}</div>
            <div><strong>VITE_PAYMENT_API_URL:</strong> {envVars.VITE_PAYMENT_API_URL || 'Not set'}</div>
            <div><strong>VITE_APP_ENVIRONMENT:</strong> {envVars.VITE_APP_ENVIRONMENT || 'Not set'}</div>
          </div>
        </div>

        {/* Connection Test */}
        <div>
          <h4 className="font-medium mb-2">Connection Status:</h4>
          <div className="flex items-center space-x-4">
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="font-medium text-red-800 mb-1">Error:</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Check that environment variables are set in Render dashboard</li>
            <li>• Verify backend service is running at https://ignite-qjis.onrender.com</li>
            <li>• Ensure CORS is configured correctly on backend</li>
            <li>• Check browser console for additional error details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackendDebugger;