# server-flask/src/routes/marcacion_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.marcacion_controller import (
    obtener_sedes,
    obtener_turnos_por_sede,
    obtener_asistencia_hoy,
    registrar_entrada,
    registrar_salida
)

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

@marcacion_bp.route("/api/asistencias/marcar", methods=["POST"])
@jwt_required()
def marcar_asistencia():
    id_usuario = get_jwt_identity()
    data = request.get_json()

    id_turno = data.get("id_turno")
    id_sede = data.get("id_sede")

    if not id_turno or not id_sede:
        return jsonify({"message": "Datos incompletos"}), 400

    asistencia = obtener_asistencia_hoy(id_usuario, id_turno)

    if not asistencia:
        resultado = registrar_entrada(id_usuario, id_sede, id_turno)

        if "error" in resultado:
            return jsonify({
                "message": resultado["error"]
            }), 403

        return jsonify({
            "message": "Entrada registrada",
            "resultado": resultado
        })


    if asistencia["hora_salida"]:
        return jsonify({"message": "Ya registraste salida hoy"}), 409

    resultado = registrar_salida(asistencia["id_asistencia"])

    if "error" in resultado:
        return jsonify({
        "message": resultado["error"]
        }), 409

    return jsonify({
        "message": "Salida registrada",
        "resultado": resultado
    })
