import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CameraProvider, useCameraContext } from './CameraContext';
import Header from './components/Header';
import Home from './components/Home';
import ShapeSync from './components/ShapeSync';
import ShapeRecorder from './components/ShapeRecorder';
import PatternTuner from './components/PatternTuner';
import ShapeReplay from './components/ShapeReplay';

const AppContent = () => {
  const { disconnectCamera, isConnected } = useCameraContext();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isConnected) {
        disconnectCamera();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isConnected, disconnectCamera]);

  return (
    <Router>
      <div className="flex flex-col h-screen max-w-screen-2xl mx-auto">
        <Header className="flex-none" /> {/* Fixed header */}
        <main className="flex-1 flex overflow-hidden">
          <Routes>
            <Route path="/*" element={<Home />} />
            <Route path="/shape-sync" element={<ShapeSync />} />
            <Route path="/touch-recorder" element={<ShapeRecorder />} />
            <Route path="/touch-replay" element={<ShapeReplay />} />
            <Route path="/pattern-tuner" element={<PatternTuner />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <CameraProvider>
      <AppContent />
    </CameraProvider>
  );
};

export default App;
