import React, { useRef, useEffect } from 'react';
import { useCameraContext } from '../CameraContext';

const VideoFeed = () => {
  const imgRef = useRef(null);
  const { isConnected, resumeVideoStream } = useCameraContext();

  useEffect(() => {
    if (isConnected) {
      resumeVideoStream();
      if (imgRef.current) {
        imgRef.current.src = 'http://localhost:5001/video_feed';
      }
    }
  }, [isConnected, resumeVideoStream]);

  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      {isConnected ? (
        <img
          ref={imgRef}
          className="w-full h-full object-cover"
          alt="Camera Feed"
        />
      ) : (
        <p>Camera not connected</p>
      )}
    </div>
  );
};

export default VideoFeed;
