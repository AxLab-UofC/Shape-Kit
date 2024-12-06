import React, { useState, useEffect, useCallback, useRef } from 'react';
import ShapeDisplay from './ShapeDisplay';
import FileList from './FileList';
import CustomSlider from '../CustomSlider';
import { listFiles, getFile, saveFile, deleteFile } from '../../utils/fileApi';

const PIN_COUNT = 5;
const BASE_HEIGHT = 1;

const Tuning = () => {
  const [files, setFiles] = useState([]);
  const [tuningFile, setTuningFile] = useState(null);
  const [replayData, setReplayData] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [heightMultiplier, setHeightMultiplier] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const defaultPinHeights = Array(PIN_COUNT)
    .fill()
    .map(() => Array(PIN_COUNT).fill(BASE_HEIGHT));

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
      setTuningFile(fileName);
    } catch (error) {
      setError('Failed to load file');
    }
  }, []);

  const handleSelectFile = useCallback(
    (fileName) => {
      if (tuningFile !== fileName) {
        loadFile(fileName);
      }
    },
    [loadFile, tuningFile]
  );

  const applyTuning = useCallback(
    (frame) => {
      return frame.map((row) =>
        row.map((height) => {
          const delta = height - BASE_HEIGHT;
          const amplifiedDelta = delta * heightMultiplier;
          return Math.max(0, Math.min(2, BASE_HEIGHT + amplifiedDelta));
        })
      );
    },
    [heightMultiplier]
  );

  useEffect(() => {
    if (tuningFile && replayData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          const nextFrame = (prevFrame + 1) % replayData.length;
          setProgress((nextFrame / (replayData.length - 1)) * 100);
          return nextFrame;
        });
      }, 100 / speedMultiplier);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [tuningFile, replayData, speedMultiplier]);

  const handleTuningToggle = useCallback(
    (file) => {
      if (tuningFile === file) {
        setTuningFile(null);
      } else {
        handleSelectFile(file);
      }
    },
    [tuningFile, handleSelectFile]
  );

  const handleDeleteFile = useCallback(
    async (fileToDelete) => {
      try {
        await deleteFile(fileToDelete);
        const updatedFiles = await listFiles();
        setFiles(updatedFiles);
        if (fileToDelete === tuningFile) {
          setTuningFile(null);
        }
      } catch (error) {
        setError('Failed to delete file');
      }
    },
    [tuningFile]
  );

  const handleReset = useCallback(() => {
    setHeightMultiplier(1);
    setSpeedMultiplier(1);
  }, []);

  const handleSave = useCallback(async () => {
    if (!newFileName) {
      setError('Please enter a file name before saving.');
      return;
    }
    const tunedData = replayData.map(applyTuning);
    try {
      await saveFile(newFileName, tunedData);
      const updatedFiles = await listFiles();
      setFiles(updatedFiles);
      setNewFileName('');
      setError(null);
    } catch (error) {
      setError('Failed to save tuned file');
    }
  }, [newFileName, replayData, applyTuning]);

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
      <h1 className="text-2xl font-bold mb-4">Pattern Tuner</h1>
      <div className="flex flex-1 space-x-6">
        <div className="w-3/4">
          <div
            className="bg-white rounded-lg shadow-lg border-2 border-black overflow-hidden p-2"
            style={{ aspectRatio: '4/3' }}
          >
            <div className="w-full h-full">
              <ShapeDisplay
                pinHeights={
                  tuningFile
                    ? applyTuning(replayData[currentFrame] || defaultPinHeights)
                    : defaultPinHeights
                }
              />
            </div>
          </div>
        </div>
        <div className="w-1/4 flex flex-col">
          <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <FileList
              files={files}
              onSelectFile={handleSelectFile}
              activeFile={tuningFile}
              onToggle={handleTuningToggle}
              onDelete={handleDeleteFile}
              mode="tune"
              progress={progress}
              onProgressChange={handleProgressChange}
            />
            <div className="mt-4">
              <label className="block mb-2">
                Height Multiplier: {heightMultiplier.toFixed(2)}
                <CustomSlider
                  value={heightMultiplier}
                  onChange={setHeightMultiplier}
                  min={0}
                  max={2}
                  step={0.01}
                />
              </label>
              <label className="block mb-2 mt-4">
                Speed Multiplier: {speedMultiplier.toFixed(2)}
                <CustomSlider
                  value={speedMultiplier}
                  onChange={setSpeedMultiplier}
                  min={0.1}
                  max={2}
                  step={0.01}
                />
              </label>
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
                className="w-full p-2 rounded mb-2"
              />
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Tuning;
