# server-flask/src/routes/infousuario_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from controllers.infousuario_controller import obtener_info_usuario_actual

infousuario_bp = Blueprint("infousuario_bp", __name__)

@infousuario_bp.route("/api/mi-informacion", methods=["GET"])
@jwt_required()
def mi_informacion():
    info = obtener_info_usuario_actual()

    if not info:
        return jsonify({"message": "Usuario no encontrado"}), 404

    return jsonify(info), 200
