import React, { useState } from "react";
import { TrashIcon, CheckIcon, XIcon } from "lucide-react";

const DeleteButton = ({ onDelete, itemId }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInitialClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete(itemId);
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleInitialClick}
        className="flex items-center px-3 py-1 text-sm text-red-500 rounded hover:bg-red-50"
      >
        <TrashIcon className="w-4 h-4 mr-1" />
        Delete
      </button>

      {showConfirmation && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCancelDelete}></div>
          
          {/* Centered confirmation dialog */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded p-4 border border-gray-200 w-64 z-50">
            <p className="text-center text-gray-800 font-medium mb-4">Are you sure you want to delete this item?</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleConfirmDelete}
                className="flex items-center px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex items-center px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                <XIcon className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DeleteButton;