from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
from connection import get_db  # your MySQL connection helper
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'super-secret-conductor-session-key'

# ---------------- LOGIN ----------------
@app.route('/')
def landing():
    return render_template('landing/index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        submitted = request.form['username'].strip()
        password = request.form['password']

        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM users WHERE username=%s OR email=%s",
            (submitted, submitted)
        )
        user = cursor.fetchone()

        if user and user['password'] == password:
            session['user_id'] = user['id']
            session['role'] = user['role']

            if user['role'] == 'driver':
                session['driver_id'] = user['id']

            cursor.execute(
                "INSERT INTO sessions (user_id) VALUES (%s)",
                (user['id'],)
            )
            conn.commit()

            cursor.close()
            conn.close()

            if user['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif user['role'] == 'driver':
                return redirect(url_for('driver_dashboard'))
            elif user['role'] == 'conductor':
                return redirect(url_for('conductor'))

        return render_template('login.html', error="Invalid login")

    return render_template('login.html')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            return render_template('forgot_password.html', message="Password reset link sent (mock)")
        else:
            return render_template('forgot_password.html', error="Email not found")

    return render_template('forgot_password.html')

# ---------------- ADMIN DASHBOARD ----------------
@app.route('/admin')
def admin_dashboard():
    if session.get('role') != 'admin':
        return redirect(url_for('login'))

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT COUNT(*) as total_sessions
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE u.role='conductor'
    """)
    total_sessions = cursor.fetchone()['total_sessions']

    cursor.execute("""
        SELECT COUNT(*) as records_today
        FROM trip_records
        WHERE DATE(created_at) = CURDATE()
    """)
    records_today = cursor.fetchone()['records_today']

    cursor.execute("SELECT * FROM trip_records ORDER BY id DESC LIMIT 1")
    last_entry = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as active_buses FROM buses WHERE status='online'")
    active_buses = cursor.fetchone()['active_buses']

    cursor.execute("SELECT IFNULL(SUM(occupancy),0) as passengers FROM trips WHERE status='active'")
    passengers = cursor.fetchone()['passengers']

    cursor.execute("""
        SELECT IFNULL((SUM(on_time=1)/COUNT(*))*100,0) as performance 
        FROM trips
    """)
    performance = round(cursor.fetchone()['performance'], 2)

    cursor.execute("""
        SELECT DATE(created_at) as day, SUM(total) as total
        FROM trip_records
        GROUP BY day
        ORDER BY day
    """)
    weekly_data = cursor.fetchall()

    cursor.execute("""
        SELECT recorded_hour, SUM(total) as total
        FROM trip_records
        GROUP BY recorded_hour
        ORDER BY recorded_hour
    """)
    hourly_data = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template(
        'admin/admin_dashboard.html',
        conductor_usage={
            "total_sessions": total_sessions,
            "records_today": records_today,
            "last_entry": last_entry
        },
        active_buses=active_buses,
        passengers=passengers,
        performance=performance,
        weekly_data=weekly_data,
        hourly_data=hourly_data
    )

# ---------------- DRIVER DASHBOARD ----------------
@app.route('/dashboard')
def driver_dashboard():
    if 'user_id' not in session or session.get('role') != 'driver':
        return redirect(url_for('login'))

    driver_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT u.username AS name, b.plate_number AS bus_plate, b.capacity, r.route_name, r.coords_json
        FROM trips t
        JOIN users u ON t.driver_id = u.id
        JOIN buses b ON t.bus_id = b.id
        JOIN routes r ON t.route_id = r.id
        WHERE u.role='driver' AND t.status='active' AND u.id=%s
    """, (driver_id,))
    driver = cursor.fetchone()
    cursor.close()
    conn.close()

    if not driver:
        return "No active trip found for this driver."

    route_coords = json.loads(driver['coords_json'])

    return render_template('driver/driver_dashboard.html',
                           driver={
                               'name': driver['name'],
                               'bus_plate': driver['bus_plate'],
                               'capacity': driver['capacity'],
                               'route_name': driver['route_name'],
                               'route_coords': route_coords
                           })

# ---------------- START TRIP ----------------
@app.route('/start_trip', methods=['POST'])
def start_trip():
    if 'driver_id' not in session:
        return jsonify({'error': 'Not logged in'}), 403

    driver_id = session['driver_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO trips (driver_id, status, start_time)
        VALUES (%s, 'active', NOW())
    """, (driver_id,))
    trip_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'trip_id': trip_id})

# ---------------- END TRIP ----------------
from datetime import datetime

@app.route('/end_trip', methods=['POST'])
def end_trip():
    if 'driver_id' not in session:
        return jsonify({'error': 'Not logged in'}), 403

    driver_id = session['driver_id']
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Get start time of active trip
    cursor.execute("""
        SELECT id, start_time 
        FROM trips 
        WHERE driver_id = %s AND status = 'active'
        ORDER BY id DESC LIMIT 1
    """, (driver_id,))
    trip = cursor.fetchone()

    if not trip:
        cursor.close()
        conn.close()
        return jsonify({'error': 'No active trip found'}), 400

    start_time = trip['start_time']
    end_time = datetime.now()
    trip_duration = end_time - start_time  # timedelta

    # Optional: format duration as HH:MM:SS
    total_seconds = int(trip_duration.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    formatted_duration = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    # Update trip
    cursor.execute("""
        UPDATE trips
        SET status='completed',
            end_time=%s
        WHERE id=%s
    """, (end_time, trip['id']))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'trip_duration': formatted_duration})

# ---------------- CONDUCTOR ----------------
@app.route('/conductor', methods=['GET', 'POST'])
def conductor():
    if session.get('role') != 'conductor':
        return redirect(url_for('login'))

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    trip_active = session.get('trip_active', False)
    trip_summary = None

    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'start_trip':
            cursor.execute("""
                INSERT INTO trips (conductor_id, status)
                VALUES (%s, 'active')
            """, (session['user_id'],))
            conn.commit()
            session['trip_id'] = cursor.lastrowid
            session['trip_active'] = True
            trip_active = True

        elif action == 'submit_count' and trip_active:
            students = int(request.form.get('students', 0))
            pwd = int(request.form.get('pwd', 0))
            senior = int(request.form.get('senior', 0))
            regular = int(request.form.get('regular', 0))
            total = students + pwd + senior + regular
            discount_total = students + pwd + senior
            hour_now = datetime.now().hour

            cursor.execute("""
                INSERT INTO trip_records 
                (trip_id, students, pwd, senior, regular, total, discount_total, recorded_hour)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (session['trip_id'], students, pwd, senior, regular, total, discount_total, hour_now))

            cursor.execute("""
                UPDATE trips 
                SET status='completed', end_time=NOW(), occupancy=%s
                WHERE id=%s
            """, (total, session['trip_id']))

            conn.commit()
            session['trip_active'] = False
            trip_active = False
            trip_summary = {
                "students": students,
                "pwd": pwd,
                "senior": senior,
                "regular": regular,
                "total": total
            }

    cursor.execute("""
        SELECT 
            SUM(students) as students,
            SUM(pwd) as pwd,
            SUM(senior) as senior,
            SUM(regular) as regular,
            SUM(total) as total
        FROM trip_records
        WHERE DATE(created_at)=CURDATE()
    """)
    summary = cursor.fetchone()

    cursor.close()
    conn.close()

    return render_template(
        'conductor.html',
        summary=summary,
        trip_summary=trip_summary,
        trip_active=trip_active
    )

# ---------------- LOGOUT ----------------
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('landing'))

if __name__ == '__main__':
    app.run(debug=True)