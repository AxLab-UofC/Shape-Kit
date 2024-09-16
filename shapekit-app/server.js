const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');

const app = express();

let pythonProcess = null;

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Create a directory for storing files if it doesn't exist
const filesDir = path.join(__dirname, 'files');
fs.mkdir(filesDir, { recursive: true }).catch(console.error);

// Proxy API requests to the Python backend
app.use(
  [
    '/video_feed',
    '/available_cameras',
    '/set_camera',
    '/pause_stream',
    '/resume_stream',
  ],
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    ws: true,
  })
);

// API endpoint to start the Python script
app.get('/api/start-camera', (req, res) => {
  if (pythonProcess) {
    return res.status(400).send('Camera is already running');
  }

  const pythonScript = path.join(__dirname, 'app.py');
  console.log(`Starting Python script: ${pythonScript}`);

  pythonProcess = spawn('python', [pythonScript], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    pythonProcess = null;
  });

  setTimeout(() => {
    if (pythonProcess) {
      res.send('Camera started');
    } else {
      res.status(500).send('Failed to start camera');
    }
  }, 1000);
});

// API endpoint to stop the Python script
app.get('/api/stop-camera', (req, res) => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    res.send('Camera stopped');
  } else {
    res.status(400).send('Camera is not running');
  }
});

// API endpoint to save a file
app.post('/api/files', async (req, res) => {
  try {
    const { fileName, data } = req.body;
    await fs.writeFile(path.join(filesDir, fileName), JSON.stringify(data));
    res.status(201).send('File saved successfully');
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).send('Error saving file');
  }
});

// API endpoint to get a file
app.get('/api/files/:fileName', async (req, res) => {
  try {
    const filePath = path.join(filesDir, req.params.fileName);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(404).send('File not found');
  }
});

// API endpoint to delete a file
app.delete('/api/files/:fileName', async (req, res) => {
  try {
    await fs.unlink(path.join(filesDir, req.params.fileName));
    res.status(200).send('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Error deleting file');
  }
});

// API endpoint to list all files
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(filesDir);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).send('Error listing files');
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));



// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Cleanup function
const cleanup = () => {
  if (pythonProcess) {
    console.log('Terminating Python process...');
    pythonProcess.kill('SIGINT');
  }
  process.exit();
};

// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
