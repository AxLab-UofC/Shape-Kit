import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/shape-sync', label: 'Shape Sync' },
    { path: '/touch-recorder', label: 'Shape Recorder' },
    { path: '/pattern-tuner', label: 'Pattern Tuner' },
    { path: '/touch-replay', label: 'Shape Replay' },
    // { path: '/archive', label: 'Archive' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 shadow-bottom">
      <div className="max-w-screen-2xl mx-auto w-full flex items-center">
        <Link to="/" className="text-xl font-bold mr-40">
          Shape-Kit
        </Link>
        <nav className="flex-grow">
          <ul className="flex justify-between items-center">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`hover:text-gray-600 pb-1 ${
                    location.pathname === item.path
                      ? 'border-b-2 border-black'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="flex items-center hover:text-gray-600"
              >
                default <FaUser className="ml-1" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
