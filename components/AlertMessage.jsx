import { AlertCircleIcon, CheckCircleIcon, X } from "lucide-react";
import React from "react";

export function AlertMessage({ type, message, onDismiss }) {
  // If no message, render nothing but maintain component structure
  if (!message) {
    return null;
  }
  
  const isError = type === "error";
  
  // Simple modal implementation without hooks
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isError ? (
                <AlertCircleIcon className="h-6 w-6 text-red-500 mr-3" />
              ) : (
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {isError ? 'Error' : 'Success'}
              </h3>
            </div>
            <button 
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={onDismiss}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isError ? 'Close' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}