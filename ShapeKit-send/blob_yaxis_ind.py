import cv2
import numpy as np
from pythonosc import udp_client

DEBUG_FLAG = True

y = 920
alpha = np.array([1.2])  # Simple contrast control, larger value, larger contrast
beta = np.array([0])  # Simple brightness control, larger value, larger brightness

class KalmanFilter:
    """A class to encapsulate the Kalman Filter for tracking blobs."""
    def __init__(self):
        # The state is a [x, y, dx, dy] vector
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

class Client:
    """Creates a client to communicate with the Processing OSC Server."""

    def __init__(self, ip="127.0.0.1", port=3333):
        self.ip = ip
        self.port = port
        self.client = udp_client.SimpleUDPClient(self.ip, self.port)

    def send(self, message: str, vals: list):
        """Sends an OSC message, alongside a series of values to the Processing OSC Server"""
        self.client.send_message(message, vals)

    def setTarget(self, x: int, y: int, target: int):
        self.send("/setTarget", [x, y, target])

def setupSimpleBlobDetector():
    # Setup SimpleBlobDetector parameters.
    params = cv2.SimpleBlobDetector_Params()
    params.filterByColor = True
    params.blobColor = 0
    params.minDistBetweenBlobs = 30
    params.minThreshold = 80
    params.maxThreshold = 255
    params.thresholdStep = 10
    params.filterByArea = True
    params.minArea = 500
    params.maxArea = 2400
    params.filterByCircularity = True
    params.minCircularity = 0.001
    params.filterByConvexity = True
    params.minConvexity = 0.01
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
	return cv2.cvtColor(frame[:][:y][:], cv2.COLOR_BGR2GRAY) 

def contrast(frame, alpha):
	# multiply every pixel value by alpha
	cv2.multiply(frame, alpha, frame)
	return

def brightness(frame, beta):
	# add a beta value to every pixel 
	cv2.add(frame, beta, frame)   
	return

def detect_blobs(frame, y, alpha, beta, detector, kf_list):
    frame = cv2.cvtColor(frame[:][:y][:], cv2.COLOR_BGR2GRAY)
    cv2.multiply(frame, alpha, frame)
    cv2.add(frame, beta, frame)

    keypoints = detector.detect(frame)
    if DEBUG_FLAG:
        frame_with_keypoints = cv2.drawKeypoints(frame, keypoints, None, (0,0,255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        cv2.imshow('Blobs', frame_with_keypoints)
        cv2.waitKey(1)

    predictions = []
    for kf, kp in zip(kf_list, sorted(keypoints, key=lambda x: x.pt)):
        measurement = np.array([[np.float32(kp.pt[0])], [np.float32(kp.pt[1])]])
        kf.correct(measurement)
        prediction = kf.predict()
        predictions.append((prediction[0], prediction[1]))
    
    return predictions

def main():
    client = Client()
    video = cv2.VideoCapture(0)
    detector = setupSimpleBlobDetector()
    kf_list = [KalmanFilter() for _ in range(25)]  # Adjust number as needed based on expected number of blobs

    while True:
        ret, frame = video.read()
        if not ret:
            print("Can't receive frame (stream end?). Exiting ...")
            break

        keypoints = detect_blobs(frame, y, alpha, beta, detector, kf_list)
        # Convert each coordinate in the keypoints to float
        flat_keypoints = [float(coord) for kp in keypoints for coord in kp]
        client.send("/setTarget", flat_keypoints)

        if DEBUG_FLAG:
            if cv2.waitKey(1) == ord('q'):
                break


if __name__ == '__main__':
    try:
        main()
    finally:
        if DEBUG_FLAG:
            cv2.destroyAllWindows()
