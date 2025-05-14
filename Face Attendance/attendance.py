import face_recognition
import cv2
import numpy as np
import os
from datetime import datetime
import csv

# Path to dataset folder
path = 'dataset'
images = []
classNames = []
myList = os.listdir(path)

# Load images and class names
for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    if curImg is not None:
        images.append(curImg)
        classNames.append(os.path.splitext(cl)[0])

# Encode faces
def find_encodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodes = face_recognition.face_encodings(img)
        if encodes:
            encodeList.append(encodes[0])
    return encodeList

# Mark attendance in CSV
def mark_attendance(name):
    filename = 'Attendance.csv'
    now = datetime.now()
    dtString = now.strftime('%Y-%m-%d %H:%M:%S')
    with open(filename, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([name, dtString])

# Get attendance data for API response
def get_attendance():
    data = []
    try:
        with open('Attendance.csv', 'r') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) == 2:
                    data.append({"name": row[0], "datetime": row[1]})
    except FileNotFoundError:
        pass
    return data

# Main function for recognition
def start_face_recognition():
    encodeListKnown = find_encodings(images)
    print("Encodings Complete")

    cap = cv2.VideoCapture(0)
    recognized_names = []

    while True:
        success, img = cap.read()
        if not success:
            break

        imgS = cv2.resize(img, (0, 0), fx=0.25, fy=0.25)
        imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

        facesCurFrame = face_recognition.face_locations(imgS)
        encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

        for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
            matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
            faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
            matchIndex = np.argmin(faceDis)

            if matches[matchIndex]:
                name = classNames[matchIndex].upper()

                if name not in recognized_names:
                    recognized_names.append(name)
                    mark_attendance(name)

                y1, x2, y2, x1 = faceLoc
                y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(img, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow('Webcam', img)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return "Recognition Complete"
