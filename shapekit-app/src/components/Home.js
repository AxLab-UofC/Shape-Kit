import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { FaHome, FaCamera } from 'react-icons/fa';
import { CgComponents } from 'react-icons/cg';
import { PiPlugsConnectedFill } from 'react-icons/pi';
import LeftNavSec from './Home/LeftNavSec';
import HomeContent from './Home/HomeContent';
import Components from './Home/Components';
import CameraConnection from './Home/CameraConnection';
import CVCalibration from './Home/CVCalibration';

const Home = () => {
  const items = [
    { icon: FaHome, text: 'Shape-Kit', path: '/' },
    { icon: CgComponents, text: 'Components', path: '/components' },
    {
      icon: PiPlugsConnectedFill,
      text: 'Camera Connection',
      path: '/camera-connection',
    },
    { icon: FaCamera, text: 'Start Tracking', path: '/cv-calibration' },
  ];

  return (
    <div className="flex w-full">
      <LeftNavSec items={items} />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomeContent />} />
          <Route path="/components" element={<Components />} />
          <Route path="/camera-connection" element={<CameraConnection />} />
          <Route path="/cv-calibration" element={<CVCalibration />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;
