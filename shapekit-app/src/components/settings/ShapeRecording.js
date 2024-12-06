import React, { useState, useEffect, useCallback } from 'react';
import ShapeDisplay from './ShapeDisplay';
import VideoFeed from '../VideoFeed';
import FileList from './FileList';
import { useCameraContext } from '../../CameraContext';
import { saveFile, listFiles, getFile, deleteFile } from '../../utils/fileApi';

const ShapeRecording = () => {
  const {
    isConnected,
    isSyncing,
    startSyncing,
    pinHeights,
    calibrate,
    error: contextError,
  } = useCameraContext();

  const [isRecording, setIsRecording] = useState(false);
  const [fileName, setFileName] = useState('');
  const [recordedData, setRecordedData] = useState([]);
  const [files, setFiles] = useState([]);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fileList = await listFiles();
        setFiles(fileList);
      } catch (error) {
        setLocalError('Failed to fetch file list');
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (isRecording && isSyncing) {
      setRecordedData((prevData) => [...prevData, pinHeights]);
    }
  }, [isRecording, isSyncing, pinHeights]);

  const handleStartRecording = useCallback(() => {
    if (!fileName) {
      setLocalError('Please enter a file name before recording.');
      return;
    }
    if (!isSyncing) {
      startSyncing();
    }
    setIsRecording(true);
    setRecordedData([]);
    setLocalError(null);
  }, [fileName, isSyncing, startSyncing]);

  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    try {
      await saveFile(fileName, recordedData);
      const updatedFiles = await listFiles();
      setFiles(updatedFiles);
      setFileName('');
    } catch (error) {
      setLocalError('Failed to save recording');
    }
  }, [fileName, recordedData]);

  const handleSelectFile = useCallback(async (selectedFile) => {
    try {
      const fileData = await getFile(selectedFile);
      setRecordedData(fileData);
    } catch (error) {
      setLocalError('Failed to load file');
    }
  }, []);

  const handleDeleteFile = useCallback(async (fileToDelete) => {
    try {
      await deleteFile(fileToDelete);
      const updatedFiles = await listFiles();
      setFiles(updatedFiles);
    } catch (error) {
      setLocalError('Failed to delete file');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Shape Recorder</h1>
      <div className="flex flex-1 space-x-6">
        <div className="w-3/4">
          <div
            className={`relative bg-white rounded-lg shadow-lg border-2 overflow-hidden p-2 ${
              isRecording ? 'border-[#FFE500]' : 'border-black'
            }`}
            style={{ aspectRatio: '4/3' }}
          >
            <div className="w-full h-full">
              <ShapeDisplay pinHeights={pinHeights} />
            </div>
            {isRecording && (
              <div className="absolute top-3 left-3 z-10">
                <div className="w-6 h-6 bg-[#FFE500] rounded-full animate-[pulse_1s_cubic-bezier(0,0,0.2,1)_infinite] shadow-[0_0_12px_rgba(255,229,0,0.9)] before:content-[''] before:absolute before:inset-0 before:rounded-full before:animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite] before:bg-[#FFE500]/50" />
              </div>
            )}
          </div>
        </div>
        <div className="w-1/4 flex flex-col">
          <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <VideoFeed />
            </div>
            <button
              className="w-full bg-gray-300 text-black py-2 rounded mb-4"
              onClick={calibrate}
            >
              Calibrate
            </button>
            <FileList
              files={files}
              onSelectFile={handleSelectFile}
              activeFile={null}
              onToggle={() => {}}
              onDelete={handleDeleteFile}
              mode="record"
            />
            <div className="mb-4">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="w-full p-2 rounded"
              />
            </div>
            <div className="flex justify-between">
              <button
                className="bg-gray-800 text-white px-4 py-2 rounded"
                onClick={handleStartRecording}
                disabled={!isConnected || isRecording}
              >
                Record
              </button>
              <button
                className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800"
                onClick={handleStopRecording}
                disabled={!isRecording}
              >
                Stop
              </button>
            </div>
          </div>
          {(contextError || localError) && (
            <div className="text-red-500 mt-2">
              {contextError || localError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShapeRecording;
