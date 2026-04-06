import mysql.connector
from mysql.connector import Error

def get_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="minibus_db",
            port=3306
        )

        if conn.is_connected():
            return conn

    except Error as e:
        print("Database connection error:", e)
        return None