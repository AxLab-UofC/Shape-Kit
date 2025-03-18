import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconContext } from 'react-icons';
import { useCameraContext } from '../../CameraContext';

const LeftNavSec = ({ title, items }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, pauseVideoStream } = useCameraContext();

  const handleNavigation = async (path) => {
    if (isConnected) {
      await pauseVideoStream();
    }
    navigate(path);
  };

  return (
    <nav className="w-56 flex-shrink-0 bg-gray-100 h-full pt-8">
      {title && <h2 className="text-lg font-semibold px-4 mb-4">{title}</h2>}
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center p-4 w-full text-left ${
                location.pathname === item.path
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              <IconContext.Provider value={{ className: 'mr-5' }}>
                <item.icon />
              </IconContext.Provider>
              <span>{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LeftNavSec;
