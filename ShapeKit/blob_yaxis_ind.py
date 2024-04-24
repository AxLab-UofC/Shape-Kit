import cv2
import numpy as np;
from pythonosc import osc_server
from pythonosc import udp_client
from pythonosc.dispatcher import Dispatcher
import threading

DEBUG_FLAG = False

y = 920
alpha = np.array([1.2]) # Simple contrast control
beta = np.array([0]) # Simple brightness control


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
	params.minThreshold = 80;
	params.maxThreshold = 255;
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
	if int(ver[0]) < 3 :
		detector = cv2.SimpleBlobDetector(params)
	else : 
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

def detect_blobs(frame, y, alpha, beta, detector):
	frame = subFrameBinary(frame, y)
	contrast(frame, alpha)
	brightness(frame, beta)

	if DEBUG_FLAG:
		points = detector.detect(frame)
		im_with_keypoints = cv2.drawKeypoints(frame, points, np.array([]), (0,0,255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
		im_with_line = cv2.line(im_with_keypoints, (0, y), (2000, y), (0, 255, 0), 1)
		cv2.imshow('im_with_line', im_with_line)

		keypoints = sorted([k.pt for k in points])
		print(len(keypoints), keypoints)
		print()

	else:
		keypoints = sorted([k.pt for k in detector.detect(frame)])

	return keypoints

def main():
	client = Client()
	video = cv2.VideoCapture(0)
	detector = setupSimpleBlobDetector()

	while True:
		ret, frame = video.read() 

		# if frame is read correctly ret is True
		if not ret:
			print("Can't receive frame (stream end?). Exiting ...")
			
		keypoints = detect_blobs(frame, y, alpha, beta, detector)
		client.send("/setTarget", np.array(keypoints).flatten())

		if DEBUG_FLAG:
			if cv2.waitKey(1) == ord('q'):
				break

if __name__ == '__main__':
	try:
		main()
	finally:
		# server.kill()
		if DEBUG_FLAG:
			cv2.destroyAllWindows()
	




