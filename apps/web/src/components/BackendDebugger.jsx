import { useState } from 'react';
import { testBackendConnection, testAuthEndpoint } from '../utils/testConnection';

export default function BackendDebugger() {
  const [isConnected, setIsConnected] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testConnection = async () => {
    setIsTesting(true);
    addLog('Starting backend connection test...', 'info');
    
    try {
      const connected = await testBackendConnection();
      setIsConnected(connected);
      
      if (connected) {
        addLog('Backend connection successful!', 'success');
        
        // Test auth endpoint
        addLog('Testing auth endpoint...', 'info');
        const authWorking = await testAuthEndpoint();
        
        if (authWorking) {
          addLog('Auth endpoint working!', 'success');
        } else {
          addLog('Auth endpoint has issues', 'warning');
        }
      } else {
        addLog('Backend connection failed', 'error');
      }
    } catch (error) {
      addLog(`Test failed: ${error.message}`, 'error');
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Backend Debugger</h3>
        <div className="flex gap-2">
          <button
            onClick={testConnection}
            disabled={isTesting}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {isConnected === null && (
            <span className="text-sm text-gray-500">Not tested</span>
          )}
          {isConnected === true && (
            <span className="text-sm text-green-600">✅ Connected</span>
          )}
          {isConnected === false && (
            <span className="text-sm text-red-600">❌ Failed</span>
          )}
        </div>
      </div>

      <div className="space-y-1 max-h-48 overflow-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`text-xs p-2 rounded ${
              log.type === 'success' ? 'bg-green-100 text-green-800' :
              log.type === 'error' ? 'bg-red-100 text-red-800' :
              log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Make sure the Ignite backend is running on localhost:8080
        </p>
      </div>
    </div>
  );
}
