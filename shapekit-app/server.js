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

// *------sending to arduino for replay ------*

const { SerialPort } = require('serialport');

// Try to find the Arduino port
async function findArduinoPort() {
  const ports = await SerialPort.list();
  console.log('🔍 Available Serial Ports:', ports);
  const arduinoPort = ports.find(
    // (port) => port.manufacturer?.includes('Arduino') || 
    // port.vendorId === '2341' ||
    // port.vendorId === '1A86' ||  // CH340 (clone)
    // port.vendorId === '6790'     // 6790 decimal = 1A86 hex (some systems report decimal)
    (port) => port.vendorId === '1a86' && port.productId === '7523'
  );// Arduino vendor ID 
  
  return arduinoPort?.path;
}

// Modified Arduino connection setup
let arduinoPort;

async function setupArduinoConnection() {
  try {
    const portPath = await findArduinoPort();
    if (!portPath) {
      console.error('No Arduino found');
      return;
    }

    arduinoPort = new SerialPort({
      path: portPath,
      baudRate: 57600,
    });

    arduinoPort.on('error', (err) => {
      console.error('Serial port error:', err);
    });

    arduinoPort.on('open', () => {
      console.log('Serial port opened successfully');
    });
  } catch (error) {
    console.error('Failed to setup Arduino connection:', error);
  }
}

// Call this when your server starts
setupArduinoConnection();

// Modify your endpoint to use the arduinoPort variable
app.post('/api/arduino/send', async (req, res) => {
  if (!arduinoPort || !arduinoPort.isOpen) {
    return res.status(500).send('Arduino not connected');
  }

  try {
    const { heights } = req.body;
    const servoPositions = convertHeightsToServoPositions(heights);
    const message = `<${servoPositions.join(',')}>`;

    arduinoPort.write(message, (err) => {
      if (err) {
        console.error('Error writing to serial port:', err);
        res.status(500).send('Failed to send data to Arduino');
      } else {
        res.status(200).send('Data sent to Arduino');
      }
    });
  } catch (error) {
    console.error('Error sending to Arduino:', error);
    res.status(500).send('Error sending to Arduino');
  }
});


function convertHeightsToServoPositions(heights) {
  // Convert heights (1.0-1.6) to servo positions (SERVOMIN-SERVOMAX)
  const SERVOMIN = 130;
  const SERVOMAX = 480;
  const positions = [];

  for (let i = 0; i < heights.length; i++) {
    for (let j = 0; j < heights[i].length; j++) {
      const height = heights[i][j];
      // Map height from 1.0-1.6 to SERVOMIN-SERVOMAX
      const position = Math.floor(
        ((height - 1.0) / 0.6) * (SERVOMAX - SERVOMIN) + SERVOMIN
      );
      positions.push(position);
    }
  }

  return positions;
}
