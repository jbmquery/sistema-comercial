# server-flask/src/routes/infoasistencia_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from controllers.infoasistencia_controller import obtener_mis_asistencias

infoasistencia_bp = Blueprint("infoasistencia_bp", __name__)

@infoasistencia_bp.route("/api/mi-asistencia", methods=["GET"])
@jwt_required()
def mi_asistencia():
    asistencias = obtener_mis_asistencias()
    return jsonify({"asistencias": asistencias}), 200
