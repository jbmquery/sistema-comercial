from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from controllers.notificaciones_controller import (
    obtener_mis_notificaciones,
    contar_pendientes,
    marcar_como_visto
)

notificaciones_bp = Blueprint("notificaciones_bp", __name__)

@notificaciones_bp.route("/api/notificaciones", methods=["GET"])
@jwt_required()
def listar():
    return jsonify(obtener_mis_notificaciones())


@notificaciones_bp.route("/api/notificaciones/pendientes-count", methods=["GET"])
@jwt_required()
def pendientes_count():
    return jsonify({"total": contar_pendientes()})


@notificaciones_bp.route("/api/notificaciones/<int:id_notificacion>/visto", methods=["PUT"])
@jwt_required()
def visto(id_notificacion):
    marcar_como_visto(id_notificacion)
    return jsonify({"message": "Notificación marcada como vista"})
