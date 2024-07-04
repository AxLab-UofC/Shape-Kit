import cv2
import numpy as np
from flask import Flask, render_template, Response
from pythonosc import udp_client
import logging

DEBUG_FLAG = True

y = 920
alpha = np.array([1.2])  # Simple contrast control, larger value, larger contrast
beta = np.array([0])  # Simple brightness control, larger value, larger brightness

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

class Client:
    '''Creates a client to communicate with the Processing OSC Server.'''

    def __init__(self, ip="127.0.0.1", port=3333):
        self.ip = ip
        self.port = port
        self.client = udp_client.SimpleUDPClient(self.ip, self.port)

    def send(self, message: str, vals: list):
        '''Sends an OSC message, alongside a series of values to the Processing OSC Server'''
        self.client.send_message(message, vals)

    def setTarget(self, x: int, y: int, target: int):
        self.send("/setTarget", [x, y, target])

def setupSimpleBlobDetector():
    # Setup SimpleBlobDetector parameters.
    params = cv2.SimpleBlobDetector_Params()

    params.filterByColor = True
    params.blobColor = 0
    params.minDistBetweenBlobs = 30

    # Change thresholds
    params.minThreshold = 80  # something I can fine tune
    params.maxThreshold = 255  #
    params.thresholdStep = 10

    # Filter by Area.
    params.filterByArea = True
    params.minArea = 500
    params.maxArea = 2400

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
    cv2.multiply(frame, alpha, frame)
    return

def brightness(frame, beta):
    # add a beta value to every pixel
    cv2.add(frame, beta, frame)
    return

def detect_blobs(frame, y, alpha, beta, detector):
    frame = subFrameBinary(frame, y)
    contrast(frame, alpha)
    brightness(frame, beta)

    points = detector.detect(frame)
    if DEBUG_FLAG:
        im_with_keypoints = cv2.drawKeypoints(frame, points, np.array([]), (0, 0, 255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        im_with_line = cv2.line(im_with_keypoints, (0, y), (2000, y), (0, 255, 0), 1)
        ret, buffer = cv2.imencode('.jpg', im_with_line)
    else:
        ret, buffer = cv2.imencode('.jpg', frame)

    if not ret:
        logging.error("Failed to encode frame")
    frame = buffer.tobytes()
    keypoints = sorted([k.pt for k in points])
    return frame, keypoints

client = Client()
detector = setupSimpleBlobDetector()

def generate_frames():
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        logging.error("Failed to open camera")
        return

    while True:
        success, frame = camera.read()
        if not success:
            logging.error("Failed to read frame from camera")
            break
        else:
            processed_frame, keypoints = detect_blobs(frame, y, alpha, beta, detector)
            client.send("/setTarget", np.array(keypoints).flatten())
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + processed_frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
