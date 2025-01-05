# Shape-Kit

Official web-version implmentation of CHI 25' paper: XXX
An interactive shape manipulation and recording system using computer vision and Arduino-controlled servo motors. The system allows real-time tracking and recording of physical pin movements, with both digital visualization and hardware control.



## Prerequisites

### Software Requirements
- Node.js >= 20.12.2
  - Download from [Node.js Package Manager](https://nodejs.org/en/download/package-manager)
  - npm >= 10.5.0 (included with Node.js)
- Python 3.9
- Arduino IDE

To verify your Node.js and npm versions:
```bash
node --version  # Should show v20.12.2 or higher
npm --version   # Should show 10.5.0 or higher
```

## Development Notes
- React frontend with Three.js for 3D visualization
- Node.js backend with Express
- Python OpenCV for camera processing
- Arduino serial communication for hardware control


## Project Structure
```
shapekit-app/
├── arduino/           # Arduino firmware
├── build/            # Production build (auto-generated)
├── files/            # Storage for recorded files
├── public/           # Static assets
├── src/              # React frontend source code
├── app.py            # Python camera/detection backend
├── server.js         # Node.js server
├── requirements.txt  # Python dependencies
└── package.json      # Node.js dependencies
```

## Installation

### 1. Python Setup

Choose either conda or venv for your virtual environment:

#### Option A: Using Conda(need download)
```bash
# Create and activate conda environment
conda create -n shapekit python=3.9
conda activate shapekit

# Install requirements
pip install -r requirements.txt
```

#### Option B: Using Virtual Environment (venv)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

Note: Make sure you have activated your virtual environment (either conda or venv) before starting the application.

### 2. Node.js Setup
```bash
# Install dependencies
npm install
```

### 3. Arduino Setup
1. Open Arduino IDE
2. Navigate to `arduino/Arduino_code_ran.ino`
3. Upload the code to your Arduino board

## Running the Application

1. Ensure your conda environment is active:
```bash
conda activate shapekit
```
or
#### On Windows:
```bash
venv\Scripts\activate
```
#### On macOS/Linux:
```bash
source venv/bin/activate
```

2. Start the application:
```bash
cd shapekit-app
npm start
```
This will:
- Build the React frontend
- Start the Node.js server
- The app will be available at `http://localhost:3001`

## Usage Guide


#### Shape Sync
1. Click "Calibrate" button
2. Use "Start Syncing" for real-time tracking
3. System will track and replicate physical pin movements

#### Shape Recorder
1. Enter a name for your recording
2. Click "Calibrate" if needed
3. Use Record/Stop buttons
4. Files save automatically

##### File Storage
Recorded patterns are stored in the `files` directory

##### Pin Order
The Shape Display uses a specific pin ordering system as shown below:
![Pin Order Diagram](./media/pin_order.png)

##### File Format
The recorded files are stored as JSON arrays, where each frame contains a 5x5 matrix of pin heights:
```json
[
  [ // Frame 1
    [1.0, 1.2, 1.1, 1.0, 1.3], // Row 1
    [1.1, 1.0, 1.2, 1.4, 1.1], // Row 2
    [1.2, 1.3, 1.1, 1.0, 1.2], // Row 3
    [1.0, 1.1, 1.2, 1.3, 1.1], // Row 4
    [1.1, 1.2, 1.0, 1.1, 1.2]  // Row 5
  ],
  [ // Frame 2
    // ... next frame's pin heights
  ]
  // ... more frames
]
```

#### Pattern Tuner
- Load existing recordings
- Create variations
- Mix different patterns
- Save new combinations

#### Shape Replay
- Select recorded files
- Use progress bar for playback control
- Physical pins will move if Arduino is connected

## Troubleshooting

### Camera Connection
- Verify USB connection
- Check for other applications using camera
- Ensure proper lighting
- Try disconnecting/reconnecting

### Arduino Issues
- Check USB connection
- Verify correct firmware upload
- Confirm power supply adequacy
- Check servo connections

### Common Problems
1. Camera Not Found:
   - Restart application
   - Check USB connection
   - Verify camera permissions

2. Arduino Not Responding:
   - Check connection
   - Verify correct firmware
   - Ensure power supply

3. Poor Tracking:
   - Improve lighting
   - Recalibrate system
   - Adjust camera position




## Contact
For questions, please contact xxxx.


## Acknowledgements
We would like to thanks the
