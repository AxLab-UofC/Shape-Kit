import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainSection from './MainSection';
import { useCameraContext } from '../../CameraContext';
import VideoFeed from '../VideoFeed';

const CVCalibration = () => {
  const navigate = useNavigate();
  const {
    isConnected,
    isConnecting,
    selectedCamera,
    availableCameras,
    connectToCamera,
    disconnectCamera,
    handleCameraChange,
  } = useCameraContext();

  return (
    <MainSection
      title="Start Tracking Module"
      subtitle=""
      buttonText="Finish Setup"
      onButtonClick={() => navigate('/shape-sync')}
    >
      <div className="space-y-4">
        <p>
          Adjust the placement of the tracking module, make sure all the marks
          are in the view and recognizable by the tracking system
        </p>
        {isConnected && (
          <div>
            <label htmlFor="camera-select" className="mr-2">
              Select Camera:
            </label>
            <select
              id="camera-select"
              value={selectedCamera}
              onChange={(e) => handleCameraChange(e.target.value)}
              className="border rounded p-1"
            >
              {availableCameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div
          className="w-full relative overflow-hidden bg-gray-100 rounded-lg"
          style={{ paddingTop: '56.25%' }}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <VideoFeed />
          </div>
        </div>
        {/* <p className="text-sm text-gray-600">
          Make sure all the marks are in the view and recognizable by the
          tracking system
        </p> */}
        <div>
          <button
            className={`${
              isConnected
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[#FFF500] hover:bg-[#FFE400]'
            } text-black px-4 py-2 rounded`}
            onClick={isConnected ? disconnectCamera : connectToCamera}
            disabled={isConnecting}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
    </MainSection>
  );
};

export default CVCalibration;
