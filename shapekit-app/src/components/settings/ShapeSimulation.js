import React from 'react';
import ShapeDisplay from './ShapeDisplay';
import VideoFeed from '../VideoFeed';
import { useCameraContext } from '../../CameraContext';

const ShapeSimulation = () => {
  const {
    isConnected,
    isSyncing,
    startSyncing,
    stopSyncing,
    pinHeights,
    calibrate,
    error,
  } = useCameraContext();

  return (
    <div className="flex flex-col min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Shape Synchronization</h1>
      <div className="flex flex-1 space-x-6">
        <div className="w-3/4">
          <div className="h-[calc(100vh-8rem)]">
            <div className="w-full">
              <div
                className="bg-white rounded-lg shadow-lg border-2 border-black overflow-hidden p-2"
                style={{
                  aspectRatio: '4/3',
                  maxHeight: 'calc(100vh - 8rem)', // Match parent height constraint
                  width: 'auto', // Allow width to adjust based on aspect ratio
                }}
              >
                <div className="w-full h-full">
                  <ShapeDisplay pinHeights={pinHeights} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/4">
          <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <VideoFeed />
            </div>
            <button
              className="w-full bg-gray-300 text-black py-2 rounded mb-4"
              onClick={calibrate}
            >
              Calibrate
            </button>
            <div className="flex justify-between">
              <button
                className="bg-gray-800 text-white px-4 py-2 rounded"
                onClick={startSyncing}
                disabled={!isConnected || isSyncing}
              >
                START
              </button>
              <button
                className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800"
                onClick={stopSyncing}
                disabled={!isSyncing}
              >
                STOP
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ShapeSimulation;
