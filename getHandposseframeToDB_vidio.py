import cv2
import mediapipe as mp
import datetime
import time

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands


# For webcam input:
video_file = "./mp4/p01_1h_if_f40_20210814_144037(3)_Y.mp4"
cap = cv2.VideoCapture(video_file)

#image = cap.read()
#length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
#height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
#fps = cap.get(cv2.CAP_PROP_FPS)
#print("총프레임:", length, "화면크기", width, "*",height, "프레임:", fps)

t_start = "00:09:15"
t_start = time.time

t_end = "00:09:27"



frame_start = 1500
frame_end = 3000

with mp_hands.Hands(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as hands:
  while cap.isOpened():
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_start)
    success, image = cap.read()
    if success:
        timest = cap.get(cv2.CAP_PROP_POS_MSEC)/1000
        print("for frame : " + str(frame_start) + "   timestamp is: ", timest)
    else:
        break

    frame_start += 1

    if not success:
      print("Ignoring empty camera frame.")
      # If loading a video, use 'break' instead of 'continue'.
      continue

    # Flip the image horizontally for a later selfie-view display, and convert
    # the BGR image to RGB.
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # To improve performance, optionally mark the image as not writeable to
    # pass by reference.
    image.flags.writeable = False
    results = hands.process(image)

    image_height, image_width, _ = image.shape

    # Draw the hand annotations on the image.
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    if results.multi_hand_landmarks:
      for hand_landmarks in results.multi_hand_landmarks:

        # Here is How to Get All the Coordinates
        for ids, landmrk in enumerate(hand_landmarks.landmark):
            # print(ids, landmrk)
            cx, cy = landmrk.x * image_width, landmrk.y*image_height
            #print(cx, cy)
            print (ids, cx, cy)

        mp_drawing.draw_landmarks(
            image,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_drawing_styles.get_default_hand_landmarks_style(),
            mp_drawing_styles.get_default_hand_connections_style())
    cv2.imshow('MediaPipe Hands', image)
    if cv2.waitKey(5) & 0xFF == 27:
        break

    if frame_start == frame_end:
        break

cap.release()



