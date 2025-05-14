
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import os
import base64
import mysql.connector
from mysql.connector import Error
from datetime import datetime

app = Flask(__name__)

# MySQL Database configuration
def insert_user(full_name, email, id_number, face_image):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='your password',
            database='face_attendance'
        )

        if conn.is_connected():
            cursor = conn.cursor()
            query = "INSERT INTO users (full_name, email, id_number, face_image) VALUES (%s, %s, %s, %s)"
            values = (full_name, email, id_number, face_image)
            cursor.execute(query, values)
            conn.commit()
            print("✅ User inserted successfully")
            return True

    except Error as e:
        print("❌ Database error:", e)
        return False

    finally:
        try:
            if cursor:
                cursor.close()
            if conn and conn.is_connected():
                conn.close()
        except:
            pass

# Ensure the face_data directory exists
FACE_DATA_FOLDER = os.path.join("static", "face_data")
os.makedirs(FACE_DATA_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/attendance')
def attendance():
    return render_template('attendance.html')

@app.route('/history')
def history():
    return render_template('history.html')

# Endpoint to receive and store user registration with face
@app.route('/register-face', methods=['POST'])
def register_face():
    try:
        data = request.get_json()

        full_name = data.get('full_name')
        email = data.get('email')
        id_number = data.get('id_number')
        image = data.get('image')  # base64 image from frontend

        if not all([full_name, email, id_number, image]):
            return jsonify({'status': 'error', 'message': 'Missing required fields'})

        # Decode base64 image and save it
        image_binary = base64.b64decode(image.split(',')[1])
        image_filename = f"{id_number}_latest.png"
        face_image = os.path.join(FACE_DATA_FOLDER, image_filename)

        with open(face_image, 'wb') as f:
            f.write(image_binary)

        # Insert user into database
        saved = insert_user(full_name, email, id_number, face_image)
        if not saved:
            return jsonify({'status': 'error', 'message': 'Database insert failed'})

        return jsonify({'status': 'success', 'message': 'User registered successfully'})

    except Exception as e:
        print("❌ Exception during registration:", e)
        return jsonify({'status': 'error', 'message': 'Server error'})

if __name__ == '__main__':
    app.run(debug=True)


