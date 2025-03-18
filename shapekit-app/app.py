from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pythonosc import udp_client
import logging
import sys
import time
import threading
import signal
import atexit

class KalmanFilter:
    """Encapsulates a Kalman Filter for tracking a blob's x, y position and velocity."""
    def __init__(self):
        self.kalman = cv2.KalmanFilter(4, 2)
        self.kalman.measurementMatrix = np.array([[1, 0, 0, 0],
                                                  [0, 1, 0, 0]], np.float32)
        self.kalman.transitionMatrix = np.array([[1, 0, 1, 0],
                                                 [0, 1, 0, 1],
                                                 [0, 0, 1, 0],
                                                 [0, 0, 0, 1]], np.float32)
        self.kalman.processNoiseCov = np.eye(4, dtype=np.float32) * 0.03
        self.kalman.measurementNoiseCov = np.eye(2, dtype=np.float32) * 1

    def predict(self):
        return self.kalman.predict()

    def correct(self, measurement):
        return self.kalman.correct(measurement)


DEBUG_FLAG = True

y = 920
alpha = 1.2  # Simple contrast control, larger value, larger contrast
beta = 0  # Simple brightness control, larger value, larger brightness

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def setupSimpleBlobDetector():
    # Setup SimpleBlobDetector parameters.
    params = cv2.SimpleBlobDetector_Params()

    params.filterByColor = True
    params.blobColor = 0
    params.minDistBetweenBlobs = 30

    # Change thresholds
    params.minThreshold = 60  # something I can fine tune
    params.maxThreshold = 255
    params.thresholdStep = 10

    # Filter by Area.
    params.filterByArea = True
    params.minArea = 500
    params.maxArea = 3000

    # Filter by Circularity
    params.filterByCircularity = True
    params.minCircularity = 0.001

    # Filter by Convexity
    params.filterByConvexity = True
    params.minConvexity = 0.01

    # Filter by Inertia
    params.filterByInertia = True
    params.minInertiaRatio = 0.001

    ver = (cv2.__version__).split('.')
    if int(ver[0]) < 3:
        detector = cv2.SimpleBlobDetector(params)
    else:
        detector = cv2.SimpleBlobDetector_create(params)

    return detector

def subFrameBinary(frame, y):
    # Convert to binary
    return cv2.cvtColor(frame[:y, :], cv2.COLOR_BGR2GRAY)

def contrast(frame, alpha):
    # multiply every pixel value by alpha
    frame = cv2.convertScaleAbs(frame, alpha=alpha)
    return frame

def brightness(frame, beta):
    # add a beta value to every pixel
    frame = cv2.convertScaleAbs(frame, beta=beta)
    return frame

# def detect_blobs(frame, y, alpha, beta, detector):
#     frame = subFrameBinary(frame, y)
#     frame = contrast(frame, alpha)
#     frame = brightness(frame, beta)

#     points = detector.detect(frame)
#     if DEBUG_FLAG:
#         im_with_keypoints = cv2.drawKeypoints(frame, points, np.array([]), (0, 0, 255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
#         im_with_line = cv2.line(im_with_keypoints, (0, y), (2000, y), (0, 255, 0), 1)
#         ret, buffer = cv2.imencode('.jpg', im_with_line)
#     else:
#         ret, buffer = cv2.imencode('.jpg', frame)

#     if not ret:
#         logging.error("Failed to encode frame")
#     frame = buffer.tobytes()
#     keypoints = sorted([k.pt for k in points])
#     return frame, keypoints

def detect_blobs(frame, y, alpha, beta, detector):
    frame = subFrameBinary(frame, y)
    frame = contrast(frame, alpha)
    frame = brightness(frame, beta)

    points = detector.detect(frame)

    if DEBUG_FLAG:
        im_with_keypoints = cv2.drawKeypoints(frame, points, np.array([]), (0, 0, 255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        im_with_line = cv2.line(im_with_keypoints, (0, y), (2000, y), (0, 255, 0), 1)
        ret, buffer = cv2.imencode('.jpg', im_with_line)
    else:
        ret, buffer = cv2.imencode('.jpg', frame)

    if not ret:
        logging.error("Failed to encode frame")
    frame_bytes = buffer.tobytes()

    # Sort keypoints for consistency
    sorted_points = sorted([k.pt for k in points])
    smoothed_keypoints = []

    for i, pt in enumerate(sorted_points):
        if i >= len(kf_list):
            break  # Prevent overflow
        kf = kf_list[i]
        measurement = np.array([[np.float32(pt[0])], [np.float32(pt[1])]])
        kf.correct(measurement)
        prediction = kf.predict()
        smoothed_keypoints.append((float(prediction[0]), float(prediction[1])))

    return frame_bytes, smoothed_keypoints


detector = setupSimpleBlobDetector()

# @app.route('/get_pin_heights')
# def get_pin_heights():
#     global last_keypoints
#     if last_keypoints:
#         # Convert keypoints to a flat list of coordinates
#         flat_keypoints = np.array(last_keypoints).flatten().tolist()
#         return jsonify(flat_keypoints)
#     else:
#         return jsonify([])

# @app.route('/get_pin_heights')
# def get_pin_heights():
#     global last_keypoints
#     if last_keypoints:
#         flat_keypoints = np.array(last_keypoints).flatten().tolist()
#         y_vals = flat_keypoints[1::2]  # Extract Y-values
#         logger.info(f"Raw Y-values from camera: {y_vals}")
#         return jsonify(flat_keypoints)
#     else:
#         return jsonify([])

@app.route('/get_pin_heights')
def get_pin_heights():
    global last_keypoints
    if last_keypoints:
        # Separate X and Y, flip Y
        flipped_keypoints = []
        for x, y in last_keypoints:
            flipped_keypoints.extend([x, 920 - y])  # Keep X, flip Y

        y_vals = flipped_keypoints[1::2]  # Extract flipped Y-values
        logger.info(f"🔄 Flipped Y-values sent to JS: {y_vals}")
        return jsonify(flipped_keypoints)
    else:
        return jsonify([])

###############################Cameras
# Global variables
camera = None
processing_active = True
stream_active = True
last_processed_frame = None
current_camera = 0
processing_thread = None
stream_lock = threading.Lock()
last_keypoints = []  # Make sure this exists globally



def get_available_cameras():
    available_cameras = []
    for i in range(10):  # Check first 10 indexes
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, _ = cap.read()
            if ret:
                available_cameras.append({"id": str(i), "name": f"Camera {i}"})
            cap.release()
    return available_cameras


kf_list = [KalmanFilter() for _ in range(25)]  # Adjust based on max blobs


def process_frames():
    global camera, processing_active, last_processed_frame, current_camera, last_keypoints
    try:
        camera = cv2.VideoCapture(current_camera)
        if not camera.isOpened():
            raise Exception(f"Failed to open camera {current_camera}")

        while processing_active:
            success, frame = camera.read()
            if not success:
                logger.error(f"Failed to read frame from camera {current_camera}")
                time.sleep(1)
                continue

            # processed_frame, keypoints = detect_blobs(frame, y, alpha, beta, detector)
            # # last_keypoints = keypoints  # Store the last detected keypoints
            # # last_processed_frame = processed_frame

            # if keypoints:
            #     last_keypoints = keypoints

            # last_processed_frame = processed_frame

            processed_frame, keypoints = detect_blobs(frame, y, alpha, beta, detector)
            last_keypoints = keypoints  # Already smoothed now!
            last_processed_frame = processed_frame


            time.sleep(0.01)

    except Exception as e:
        logger.error(f"Error in process_frames: {str(e)}")
    finally:
        if camera is not None:
            camera.release()
        logger.info("Camera released")

def generate_frames():
    global last_processed_frame, stream_active
    while True:
        if not stream_active:
            time.sleep(0.1)
            continue

        if last_processed_frame is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + last_processed_frame + b'\r\n')

        time.sleep(0.03)  # Adjust this value to control frame rate


def cleanup():
    global processing_active, stream_active, camera
    logger.info("Cleaning up resources...")
    processing_active = False
    stream_active = False
    if processing_thread:
        processing_thread.join(timeout=5)
    if camera:
        camera.release()
    cv2.destroyAllWindows()
    logger.info("Cleanup completed.")

def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}. Initiating shutdown...")
    cleanup()
    sys.exit(0)

# Register the cleanup function to be called on exit
atexit.register(cleanup)

# Set up signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


@app.route('/video_feed')
def video_feed():
    logger.info("Video feed requested")
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/pause_stream')
def pause_stream():
    global stream_active
    with stream_lock:
        stream_active = False
    time.sleep(0)  # Small delay to ensure the change takes effect
    return "Stream paused"

@app.route('/resume_stream')
def resume_stream():
    global stream_active
    with stream_lock:
        stream_active = True
    time.sleep(0.1)  # Small delay to ensure the change takes effect
    return "Stream resumed"

@app.route('/stop_processing')
def stop_processing():
    global processing_active
    processing_active = False
    return "Processing stopped"

@app.route('/available_cameras')
def available_cameras():
    cameras = get_available_cameras()
    return jsonify(cameras)

@app.route('/set_camera/<int:camera_id>')
def set_camera(camera_id):
    global current_camera, camera, processing_active
    if camera_id != current_camera:
        current_camera = camera_id
        if camera is not None:
            camera.release()
        camera = None
        processing_active = False
        time.sleep(0.1)  # Give time for the processing thread to stop
        processing_active = True
        threading.Thread(target=process_frames, daemon=True).start()
    return f"Camera set to {camera_id}"




if __name__ == '__main__':
    processing_thread = threading.Thread(target=process_frames, daemon=True)
    processing_thread.start()

    logger.info("Starting Flask app for camera feed...")
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False, threaded=True)
