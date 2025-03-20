import React, { useState, useEffect, useCallback, useRef } from 'react';
import ShapeDisplay from './ShapeDisplay';
import FileList from './FileList';
import { listFiles, getFile, deleteFile } from '../../utils/fileApi';

const PIN_COUNT = 5;
const DEFAULT_HEIGHT = 1;


const ShapeReplaying = () => {
  const [files, setFiles] = useState([]);
  const [playingFile, setPlayingFile] = useState(null);
  const [replayData, setReplayData] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const defaultPinHeights = Array(PIN_COUNT)
    .fill()
    .map(() => Array(PIN_COUNT).fill(DEFAULT_HEIGHT));

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fileList = await listFiles();
        setFiles(fileList);
      } catch (error) {
        setError('Failed to fetch file list');
      }
    };
    fetchFiles();
  }, []);

  const loadFile = useCallback(async (fileName) => {
    try {
      const fileData = await getFile(fileName);
      setReplayData(fileData);
      setCurrentFrame(0);
      setProgress(0);
    } catch (error) {
      setError('Failed to load file');
    }
  }, []);

  const handleSelectFile = useCallback(
    (fileName) => {
      if (playingFile !== fileName) {
        loadFile(fileName);
        setPlayingFile(fileName);
      }
    },
    [loadFile, playingFile]
  );

  const updateProgress = useCallback(() => {
    if (replayData.length > 0) {
      setProgress((currentFrame / (replayData.length - 1)) * 100);
    }
  }, [currentFrame, replayData]);

  //   useEffect(() => {
  //     if (playingFile && replayData.length > 0) {
  //       intervalRef.current = setInterval(() => {
  //         setCurrentFrame((prevFrame) => (prevFrame + 1) % replayData.length);
  //       }, 100);
  //     } else {
  //       clearInterval(intervalRef.current);
  //     }

  //     return () => clearInterval(intervalRef.current);
  //   }, [playingFile, replayData]);

  const sendToArduino = useCallback(async (heights) => {
    console.log('📤 Sending to Arduino:', heights);  // <== ADD THIS LINE

    try {
      await fetch('/api/arduino/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ heights }),
      });
    } catch (error) {
      console.error('Failed to send to Arduino:', error);
    }
  }, []);

  useEffect(() => {
    if (playingFile && replayData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          const newFrame = (prevFrame + 1) % replayData.length;
          sendToArduino(replayData[newFrame]);
          return newFrame;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [playingFile, replayData, sendToArduino]);

  useEffect(() => {
    updateProgress();
  }, [currentFrame, updateProgress]);

  const handlePlayPause = useCallback(
    (file) => {
      if (playingFile === file) {
        setPlayingFile(null);
      } else {
        handleSelectFile(file);
      }
    },
    [playingFile, handleSelectFile]
  );

  const handleDeleteFile = useCallback(
    async (fileToDelete) => {
      try {
        await deleteFile(fileToDelete);
        const updatedFiles = await listFiles();
        setFiles(updatedFiles);
        if (fileToDelete === playingFile) {
          setPlayingFile(null);
        }
      } catch (error) {
        setError('Failed to delete file');
      }
    },
    [playingFile]
  );

  const handleProgressChange = useCallback(
    (newProgress) => {
      if (replayData.length > 0) {
        const newFrame = Math.floor(
          (newProgress / 100) * (replayData.length - 1)
        );
        setCurrentFrame(newFrame);
        setProgress(newProgress);
      }
    },
    [replayData]
  );

  //new reset function
  const handleResetPins = useCallback(async () => {
    // Stop playback
    setPlayingFile(null);
    setReplayData([]);
    setCurrentFrame(0);
    setProgress(0);

    const defaultHeights2D = Array(PIN_COUNT)
    .fill()
    .map(() => Array(PIN_COUNT).fill(DEFAULT_HEIGHT));

  try {
    console.log('📤 Sending RESET to Arduino:', defaultHeights2D);  // Add this log
    await sendToArduino(defaultHeights2D);
  } catch (error) {
    console.error('Failed to reset pins:', error);
  }
}, [sendToArduino]);
  
  //   const defaultHeightsFlat = Array(PIN_COUNT * PIN_COUNT).fill(DEFAULT_HEIGHT);
  //   try {
  //     // Send flat array to Arduino
  //     await sendToArduino(defaultHeightsFlat);
  //   } catch (error) {
  //     console.error('Failed to reset pins:', error);
  //   }
  // }, [sendToArduino]);
  

  return (
    <div className="flex flex-col min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Shape Replay</h1>
      <div className="flex flex-1 space-x-6">
        <div className="w-3/4">
          <div className="h-[calc(100vh-8rem)]">
            <div className="w-full">
              <div
                className="bg-white rounded-lg shadow-lg border-2 border-black overflow-hidden p-2"
                style={{
                  aspectRatio: '4/3',
                  maxHeight: 'calc(100vh - 8rem)', // Match parent height constraint
                  width: 'auto', // Allow width to adjust based on aspect ratio
                }}
              >
                <div className="w-full h-full">
                  <ShapeDisplay
                    pinHeights={replayData[currentFrame] || defaultPinHeights}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/4">
          <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <FileList
              files={files}
              onSelectFile={handleSelectFile}
              activeFile={playingFile}
              onToggle={handlePlayPause}
              onDelete={handleDeleteFile}
              mode="replay"
              progress={progress}
              onProgressChange={handleProgressChange}
            />
            <button
              className="w-full bg-white text-gray-800 px-4 py-2 rounded border border-gray-800"
              onClick={handleResetPins}  // You'll define this function
            >
              Reset
            </button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ShapeReplaying;
