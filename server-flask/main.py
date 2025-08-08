from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app) # Enable CORS for all routes


#CONFIGURACION BASE DE DATOS

DB_CONFIG = {
    "host": "localhost",
    "user": "postgres",
    "password": "123",
    "database": "db_servicios"
}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

        query = """
        SELECT id_usuario, correo
        FROM usuarios
        WHERE correo = %s AND pass_encrip = %s
        """
        cursor.execute(query, (email, password))
        user = cursor.fetchone()

        if user:
            return jsonify({"success": True, "message": "Login exitoso", "user_id": user[0]})
        else:
            return jsonify({"success": False, "message": "Correo o contraseña incorrectos"}), 401

    except Exception as ex:
        return jsonify({"success": False, "message": f"Error en el servidor: {ex}"}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True) #by default, Flask runs on port 5000

