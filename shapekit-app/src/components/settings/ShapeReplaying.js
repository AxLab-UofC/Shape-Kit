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

  return (
    <div className="flex flex-col h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Shape Replay</h1>
      <div className="flex flex-1 space-x-6">
        <div className="w-3/4">
          <div
            className="bg-white rounded-lg shadow-lg border-2 border-black"
            style={{ aspectRatio: '4/3' }}
          >
            <ShapeDisplay
              pinHeights={replayData[currentFrame] || defaultPinHeights}
            />
          </div>
        </div>
        <div className="w-1/4 flex flex-col">
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
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ShapeReplaying;
