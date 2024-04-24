import cv2
import numpy as np
import imutils

start_points = []
distances_dict = {}

# Function to process frames
def process_frame(frame):
    # Split HSV Channels and boost saturation
    (h, s, v) = cv2.split(cv2.cvtColor(frame, cv2.COLOR_BGR2HSV))
    s = np.clip(s * 1.2, 0, 255).astype("uint8")
    hsv = cv2.merge([h, s, v])

    # Create mask to capture pixels between yellow bounds
    lower_yellow = np.array([20, 150, 150])
    upper_yellow = np.array([45, 225, 255])
    yellowmask = cv2.inRange(hsv, lower_yellow, upper_yellow)

    # Fill holes in yellow mask
    kernel = np.ones((12, 12), np.uint8)
    yellowmask = cv2.morphologyEx(yellowmask, cv2.MORPH_CLOSE, kernel)

    # Set all pixels not in yellow tubes to white
    whiteframe = np.full(frame.shape, (255, 255, 255), dtype=np.uint8)
    yellow = cv2.bitwise_not(255 - frame, whiteframe, mask=yellowmask)

    # Convert image to grayscale
    grayscale = cv2.cvtColor(yellow, cv2.COLOR_BGR2GRAY)

    # Track all pixels that are darker than the threshold, and fill holes
    threshold = 175
    _, masked = cv2.threshold(grayscale, threshold, 255, cv2.THRESH_BINARY)
    masked = cv2.morphologyEx(masked, cv2.MORPH_CLOSE, kernel)
    
    # Visualize intermediate layers
    cv2.imshow('Yellow Mask', yellowmask)
    cv2.imshow('Grayscale Image', grayscale)
    cv2.imshow('Thresholded Mask', masked)

    return masked

# Function to detect and draw contours
def detect_contours(frame, masked):
    # Setting parameter values
    t_lower = 50  # Lower Threshold
    t_upper = 150  # Upper threshold

    # Applying the Canny Edge filter to select groups of dark pixels.
    edges = cv2.Canny(masked, t_lower, t_upper)
    contours = imutils.grab_contours(cv2.findContours(edges, cv2.RETR_LIST, 
                                                      cv2.CHAIN_APPROX_SIMPLE))
    print("Number of Contours found = " + str(len(contours)))

    # Draw contours on the frame and get the relative distances 
    for idx, c in enumerate(contours):
        M = cv2.moments(c)
        if M['m00'] != 0:
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])
            cv2.circle(frame, (cX, cY), 7, (255, 255, 255), -1)
            if idx < len(start_points):  # Check if index is within range
                start_x, start_y = start_points[idx]
                distance = np.sqrt((cX - start_x)**2 + (cY - start_y)**2)
                if idx not in distances_dict:  # Initialize distances_dict[idx]
                    distances_dict[idx] = []
                distances_dict[idx].append(distance)
            else:
                start_points.append((cX, cY)); 
                distances_dict[idx] = []
                distances_dict[idx].append(0); 

    return frame

# Main function to process video
def process_video(video_path):
    # Open the video
    vid = cv2.VideoCapture(video_path)
    if not vid.isOpened():
        print("Error opening video file")
        return

    while(vid.isOpened()):
        # Capture the video frame by frame
        ret, frame = vid.read()
        if not ret:
            print("End of video")
            break

        # Process the frame
        masked = process_frame(frame)

        # Detect and draw contours
        contours = detect_contours(frame, masked)

        # show frame with tracked objects
        cv2.imshow('frame', frame)

        # Check for 'q' key press to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the video capture object and close windows
    vid.release()
    cv2.destroyAllWindows()
    
    print("Distances Dictionary:", distances_dict)

# Main program
if __name__ == "__main__":
    video_path = 'IMG_0.mov'  # Update with your video file path
    process_video(video_path)
