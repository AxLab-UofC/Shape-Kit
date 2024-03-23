 
# import the opencv library 
import cv2 
import numpy as np
import imutils
  
  
# define a video capture object 
# vid = cv2.VideoCapture(0) 

##temporarily using pre-recorded video instead of live camera feed
vid = cv2.VideoCapture('IMG_0430.mov')

kernel = np.ones((12,12),np.uint8)
  
#Use for live camera feed
#while(True):

# iterate through all frames in video
while(vid.isOpened()): 
      
    # Capture the video frame by frame
    ret, frame = vid.read() 

    # Split HSV Channels and boost saturation
    (h, s, v) = cv2.split(cv2.cvtColor(frame, cv2.COLOR_BGR2HSV))
    s = np.clip(s * 1.2, 0, 255).astype("uint8")
    hsv = cv2.merge([h,s,v])

    # Create mask to capture pixels between yellow bounds
    lower_yellow = np.array([20, 150, 150]) 
    upper_yellow = np.array([45, 225, 255]) 
    yellowmask = cv2.inRange(hsv, lower_yellow, upper_yellow) 

    # fill holes in yellow mask
    yellowmask = cv2.morphologyEx(yellowmask, cv2.MORPH_CLOSE, kernel)

    #set all pixels not in yellow tubes to white
    whiteframe = np.full(frame.shape, (255, 255, 255), dtype=np.uint8)
    yellow = cv2.bitwise_not(255 - frame, whiteframe, mask=yellowmask)
    
    #covert image to greyscale
    grayscale = cv2.cvtColor(yellow, cv2.COLOR_BGR2GRAY) 

    #track all pixels that are darker than the treshold, and fill holes
    threshold = 168
    _, masked = cv2.threshold(grayscale, threshold, 255, cv2.THRESH_BINARY)
    masked = cv2.morphologyEx(masked, cv2.MORPH_CLOSE, kernel)

    # Setting parameter values 
    t_lower = 50  # Lower Threshold 
    t_upper = 150  # Upper threshold 
    
    # Applying the Canny Edge filter to select groups of dark pixels.
    edges = cv2.Canny(masked, t_lower, t_upper) 
    contours = imutils.grab_contours(cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE))
    print("Number of Contours found = " + str(len(contours))) 

    #get centers of all the dark pixel groups and draw them on the frame
    for c in contours:
        M = cv2.moments(c)
        if M['m00'] != 0:
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])

            cv2.circle(frame, (cX, cY), 7, (255, 255, 255), -1)
            # cv2.drawContours(frame, [c], -1, (0, 255, 0), 3) 

    #show frame with tracked objects
    cv2.imshow('frame', frame) 
    
    # the 'q' button is set as the 
    # quitting button you may use any 
    # desired button of your choice 
    if cv2.waitKey(1) & 0xFF == ord('q'): 
        break
  
# After the loop release the cap object 
vid.release() 
# Destroy all the windows 
cv2.destroyAllWindows() 