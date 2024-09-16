import React from 'react';
import { FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import { MdOutlineSettingsInputComponent } from 'react-icons/md';

const FileList = ({
  files,
  onSelectFile,
  activeFile,
  onToggle,
  onDelete,
  mode,
  progress,
  onProgressChange,
}) => {
  const renderButtons = (file) => {
    switch (mode) {
      case 'record':
        return (
          <button
            onClick={() => onDelete(file)}
            className="text-red-500 hover:text-red-700"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        );
      case 'tune':
      case 'replay':
        return (
          <>
            <button
              onClick={() => onToggle(file)}
              className={`text-gray-600 hover:text-gray-900 ${
                activeFile === file ? 'text-blue-500' : ''
              } mr-2`}
              title={
                mode === 'tune'
                  ? 'Tune'
                  : activeFile === file
                  ? 'Pause'
                  : 'Play'
              }
            >
              {mode === 'tune' ? (
                <MdOutlineSettingsInputComponent size={18} />
              ) : activeFile === file ? (
                <FaPause size={16} />
              ) : (
                <FaPlay size={16} />
              )}
            </button>
            <button
              onClick={() => onDelete(file)}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Recorded Files</h3>
      {files.length === 0 ? (
        <p>No recorded files yet.</p>
      ) : (
        <ul className="bg-white rounded-lg border border-gray-200 w-full text-gray-900">
          {files.map((file, index) => (
            <li
              key={index}
              className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg"
            >
              <div className="flex justify-between items-center">
                <span
                  className="cursor-pointer"
                  onClick={() => onSelectFile(file)}
                >
                  {file}
                </span>
                <div>{renderButtons(file)}</div>
              </div>
              {(mode === 'replay' || mode === 'tune') &&
                activeFile === file && (
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => onProgressChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #FFE400 0%, #FFE400 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`,
                      }}
                    />
                  </div>
                )}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #000000;
          cursor: pointer;
          border-radius: 50%;
        }
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #000000;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
        input[type='range']::-ms-thumb {
          width: 16px;
          height: 16px;
          background: #000000;
          cursor: pointer;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default FileList;
