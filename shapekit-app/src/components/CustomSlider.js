import React, { useState, useRef, useCallback } from 'react';

const CustomSlider = ({ value, onChange, min, max, step }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const updateValue = useCallback(
    (clientX) => {
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = (clientX - rect.left) / rect.width;
      const newValue = Math.min(
        max,
        Math.max(min, min + percentage * (max - min))
      );
      onChange(parseFloat(newValue.toFixed(2)));
    },
    [min, max, onChange]
  );

  const handleMouseDown = useCallback(
    (e) => {
      setIsDragging(true);
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className="relative w-full h-8 bg-gray-300 rounded-full cursor-pointer"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute top-0 left-0 h-full bg-[#FFE400] rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
      <div
        className="absolute top-0 w-8 h-8 bg-white border-2 border-[#FFE400] rounded-full shadow-md transform -translate-x-1/2"
        style={{ left: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default CustomSlider;
