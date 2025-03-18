import React from 'react';

const MainSection = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  children,
}) => (
  <div className="flex-grow flex flex-col p-8 overflow-hidden">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-gray-600 mb-4">{subtitle}</p>
    <div className="flex-grow overflow-auto mb-4">{children}</div>
    {buttonText && onButtonClick && (
      <div className="text-right">
        <button
          onClick={onButtonClick}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {buttonText}
        </button>
      </div>
    )}
  </div>
);

export default MainSection;
