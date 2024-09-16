import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainSection from './MainSection';
import Image1 from '../../images/connect1.png';
import Image2 from '../../images/Connect2.png';

const CameraConnection = () => {
  const navigate = useNavigate();

  return (
    <MainSection
      title="Camera Connection"
      subtitle="Connect and set up your camera tracking module"
      buttonText="Next: Calibrate Camera"
      onButtonClick={() => navigate('../cv-calibration')}
    >
      <div className="flex space-x-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            Step 1: Connect Tracking Module to PC
          </h3>
          <div className="border rounded-lg p-4">
            <div className="flex-1 space-y-4">
              <img
                src={Image1}
                alt="Description of Component 1"
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
          <p className="mt-2 text-center">
            Connect the Tracking Module to the PC through USB
          </p>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            Step 2: Mount Tracking Module to ShapeKit
          </h3>
          <div className="border rounded-lg p-4">
            <div className="flex-1 space-y-4">
              <img
                src={Image2}
                alt="Description of Component 1"
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
          <p className="mt-2 text-center">
            Mount the Tracking Module to the Window module
            <br />
            <span className="block text-sm italic mt-1">
              (the USB cable side faces toward the input shape display)
            </span>
          </p>
        </div>
      </div>
    </MainSection>
  );
};

export default CameraConnection;
