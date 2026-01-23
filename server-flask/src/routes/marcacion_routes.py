from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from controllers.marcacion_controller import obtener_sedes, obtener_turnos_por_sede

marcacion_bp = Blueprint("marcacion_bp", __name__)

@marcacion_bp.route("/api/sedes", methods=["GET"])
@jwt_required()
def sedes():
    return jsonify({"sedes": obtener_sedes()})

@marcacion_bp.route("/api/turnos", methods=["GET"])
@jwt_required()
def turnos():
    id_sede = request.args.get("id_sede")
    return jsonify({"turnos": obtener_turnos_por_sede(id_sede)})
