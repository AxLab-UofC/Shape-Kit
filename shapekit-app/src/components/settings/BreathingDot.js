import React from 'react';

const BreathingDot = () => {
  return (
    <div className="absolute top-2 left-2 z-10">
      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
    </div>
  );
};

export default BreathingDot;
