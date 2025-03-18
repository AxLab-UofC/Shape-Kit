import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import debounce from 'lodash/debounce';

const CameraContext = createContext();

export const useCameraContext = () => useContext(CameraContext);

const PIN_COUNT = 5;
const DEFAULT_HEIGHT = 1;
const MIN_HEIGHT = 1;
const MAX_HEIGHT = 1.6;
const MAX_DIFF = 160; // Assuming a maximum difference of 160 in keypoint values

export const CameraProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('0');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pinHeights, setPinHeights] = useState(
    Array(PIN_COUNT)
      .fill()
      .map(() => Array(PIN_COUNT).fill(DEFAULT_HEIGHT))
  );
  const [referenceHeights, setReferenceHeights] = useState(null);

  const fetchAvailableCameras = async () => {
    try {
      const response = await fetch('http://localhost:5001/available_cameras');
      if (response.ok) {
        const cameras = await response.json();
        setAvailableCameras(cameras);
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].id);
        }
      } else {
        throw new Error('Failed to fetch available cameras');
      }
    } catch (error) {
      console.error('Error fetching available cameras:', error);
      setError('Failed to fetch available cameras. Please try again.');
    }
  };

  const connectToCamera = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const startResponse = await fetch('/api/start-camera');
      if (!startResponse.ok) {
        throw new Error('Failed to start camera');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetchAvailableCameras();

      const feedResponse = await fetch('http://localhost:5001/video_feed', {
        method: 'HEAD',
      });
      if (feedResponse.ok) {
        setIsConnected(true);
      } else {
        throw new Error('Video feed not available');
      }
    } catch (error) {
      console.error('Error connecting to camera:', error);
      setError('Failed to connect to the camera. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectCamera = async () => {
    try {
      const response = await fetch('/api/stop-camera');
      if (response.ok) {
        setIsConnected(false);
        setAvailableCameras([]);
      } else if (response.status === 400) {
        console.log('Camera was already disconnected');
        setIsConnected(false);
        setAvailableCameras([]);
      } else {
        throw new Error('Failed to stop camera');
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
      setError('Failed to stop the camera. Please try again.');
    }
  };

  const handleCameraChange = async (cameraId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/set_camera/${cameraId}`
      );
      if (response.ok) {
        setSelectedCamera(cameraId);
      } else {
        throw new Error('Failed to change camera');
      }
    } catch (error) {
      console.error('Error changing camera:', error);
      setError('Failed to change the camera. Please try again.');
    }
  };

  const pauseVideoStream = useCallback(async () => {
    try {
      console.log('pause');
      await fetch('http://localhost:5001/pause_stream');
    } catch (error) {
      console.error('Failed to pause stream:', error);
    }
  }, []);

  const resumeVideoStream = useCallback(async () => {
    try {
      console.log('again');
      await fetch('http://localhost:5001/resume_stream');
    } catch (error) {
      console.error('Failed to resume stream:', error);
    }
  }, []);

  const debouncedPauseVideoStream = useMemo(
    () => debounce(pauseVideoStream, 300),
    [pauseVideoStream]
  );

  const debouncedResumeVideoStream = useMemo(
    () => debounce(resumeVideoStream, 300),
    [resumeVideoStream]
  );

  const fetchKeypoints = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/get_pin_heights');
      const data = await response.json();
      const yValues = data.filter((_, index) => index % 2 === 1).reverse();
      // const yValues = data.filter((_, index) => index % 2 === 1);
      return yValues;
      console.log("📊 Normalized Y-values:", yValues);
  
    } catch (error) {
      console.error('Error fetching keypoints:', error);
      return null;
    }
  }, []);

  // const fetchKeypoints = useCallback(async () => {
  //   try {
  //     const response = await fetch('http://localhost:5001/get_pin_heights');
  //     const data = await response.json();
  //     const yValues = data.filter((_, index) => index % 2 === 1);  // Extract Y
  
  //     console.log("📸 Raw Y-values from Python:", yValues);
  
  //     // const normalizedY = yValues.map(y => y / 920);  // Normalize 0 to 1
  //     const normalizedY = yValues.map(y => 1 - (y / 920));
  
  //     console.log("📊 Normalized Y-values (0-bottom, 1-top):", normalizedY);
  
  //     return normalizedY;
  //   } catch (error) {
  //     console.error('Error fetching keypoints:', error);
  //     return null;
  //   }
  // }, []);
  

  const convertKeypointsToHeights = useCallback((keypoints) => {
    const grid = Array(PIN_COUNT)
      .fill()
      .map(() => Array(PIN_COUNT).fill(null));

    for (
      let i = 0;
      i < Math.min(PIN_COUNT * PIN_COUNT, keypoints.length);
      i++
    ) {
      const x = Math.floor(i / PIN_COUNT);
      const y = i % PIN_COUNT;
      grid[x][y] = keypoints[i];
    }

    return grid;
  }, []);

  const updateSyncHeights = useCallback(
    (newHeights) => {
      if (!referenceHeights) {
        console.error('Reference heights not set. Cannot update sync heights.');
        return;
      }

      const updatedHeights = newHeights.map((row, i) =>
        row.map((height, j) => {
          if (height === null) {
            return pinHeights[i][j];
          }
          const refHeight = referenceHeights[i][j];
          const diff = height - refHeight;
          const mappedDiff = (diff / MAX_DIFF) * (MAX_HEIGHT - MIN_HEIGHT);
          const newHeight = Math.max(
            MIN_HEIGHT,
            Math.min(MAX_HEIGHT, MIN_HEIGHT + mappedDiff)
          );

          return newHeight;
        })
      );

      console.log("📐 Updated pin heights for display:", updatedHeights);

      setPinHeights(updatedHeights);
    },
    [referenceHeights, pinHeights]
  );

  // const updateSyncHeights = useCallback((newHeights) => {
  //   if (!referenceHeights) {
  //     console.error('Reference heights not set. Cannot update sync heights.');
  //     return;
  //   }
  
  //   const updatedHeights = newHeights.map((height, i) => {
  //     if (height === null) return pinHeights[i];
  //     const refHeight = referenceHeights[i];
  //     const diff = refHeight - height;  // Match Processing
  //     const mappedDiff = (diff / MAX_DIFF) * (MAX_HEIGHT - MIN_HEIGHT);
  //     const finalHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, MIN_HEIGHT + mappedDiff));
  //     return finalHeight;
  //   });
  
  //   console.log("📐 Updated pin heights for display:", updatedHeights);
  
  //   setPinHeights(updatedHeights);
  // }, [referenceHeights, pinHeights]);
  

  const startSyncing = useCallback(async () => {
    if (!isConnected) {
      setError('Camera is not connected. Please connect the camera first.');
      return;
    }
    if (!referenceHeights) {
      setError('Reference heights not set. Please calibrate first.');
      return;
    }

    if (isConnected && referenceHeights) setError(null);

    setIsSyncing(true);
  }, [isConnected, referenceHeights]);

  const stopSyncing = useCallback(() => {
    setIsSyncing(false);
    // Reset pin heights to default
    setPinHeights(
      Array(PIN_COUNT)
        .fill()
        .map(() => Array(PIN_COUNT).fill(DEFAULT_HEIGHT))
    );
  }, []);

  const calibrate = useCallback(async () => {
    const keypoints = await fetchKeypoints();
    if (keypoints) {
      const calibratedHeights = convertKeypointsToHeights(keypoints);
      setReferenceHeights(calibratedHeights);
      // Reset pin heights to default
      setPinHeights(
        Array(PIN_COUNT)
          .fill()
          .map(() => Array(PIN_COUNT).fill(DEFAULT_HEIGHT))
      );
    }
  }, [fetchKeypoints, convertKeypointsToHeights]);

  useEffect(() => {
    let intervalId;
    if (isSyncing) {
      intervalId = setInterval(async () => {
        const keypoints = await fetchKeypoints();
        if (keypoints) {
          const heights = convertKeypointsToHeights(keypoints);
          updateSyncHeights(heights);
        }
      }, 100); // Adjust interval as needed
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSyncing, fetchKeypoints, convertKeypointsToHeights, updateSyncHeights]);

  useEffect(() => {
    return () => {
      debouncedPauseVideoStream.cancel();
      debouncedResumeVideoStream.cancel();
    };
  }, [debouncedPauseVideoStream, debouncedResumeVideoStream]);

  useEffect(() => {
    fetchKeypoints();
  }, [fetchKeypoints]);

  const value = {
    isConnected,
    isConnecting,
    selectedCamera,
    availableCameras,
    error,
    connectToCamera,
    disconnectCamera,
    handleCameraChange,
    pauseVideoStream: debouncedPauseVideoStream,
    resumeVideoStream: debouncedResumeVideoStream,
    isSyncing,
    startSyncing,
    stopSyncing,
    pinHeights,
    calibrate,
  };

  return (
    <CameraContext.Provider value={value}>{children}</CameraContext.Provider>
  );
};
