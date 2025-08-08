from flask import Blueprint, request, jsonify
from controllers.login_controller import login_user

login_bp = Blueprint('login_bp', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    correo = data.get('email')
    password = data.get('password')

    user = login_user(correo, password)
    if user:
        return jsonify({"message": "Login exitoso", "user": user}), 200
    else:
        return jsonify({"message": "Credenciales incorrectas"}), 401
