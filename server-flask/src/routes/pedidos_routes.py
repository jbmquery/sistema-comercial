# server-flask/src/routes/pedidos_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from controllers.pedidos_controller import (
    crear_pedido,
    agregar_detalle_pedido,
    actualizar_estado_detalle,
    actualizar_observacion_detalle,
    cambiar_mesa_pedido
)
from controllers.orden_controller import get_pedidos_activos

pedidos_bp = Blueprint("pedidos_bp", __name__)

@pedidos_bp.route("/api/pedidos", methods=["GET"])
@jwt_required()
def listar_pedidos():
    return get_pedidos_activos()

@pedidos_bp.route("/api/pedidos", methods=["POST"])
@jwt_required()
def crear_pedido_route():
    data = request.get_json()
    resultado = crear_pedido(data)

    if resultado.get("success"):
        return jsonify(resultado), 201

    return jsonify(resultado), 500

@pedidos_bp.route("/api/pedidos/<int:id_pedido>/detalle", methods=["POST"])
@jwt_required()
def agregar_detalle_route(id_pedido):
    data = request.get_json()
    resultado = agregar_detalle_pedido(id_pedido, data)

    if resultado.get("success"):
        return jsonify(resultado), 201

    return jsonify(resultado), 400


@pedidos_bp.route("/api/detalle/<int:id_detalle>/estado", methods=["PUT"])
@jwt_required()
def actualizar_estado_detalle_route(id_detalle):
    data = request.get_json()
    estado = data.get("estado")

    resultado = actualizar_estado_detalle(id_detalle, estado)

    if resultado.get("success"):
        return jsonify(resultado), 200

    return jsonify(resultado), 400

@pedidos_bp.route("/api/detalle/<int:id_detalle>/observacion", methods=["PUT"])
@jwt_required()
def actualizar_observacion_route(id_detalle):
    data = request.get_json()
    observacion = data.get("observacion", "")

    resultado = actualizar_observacion_detalle(id_detalle, observacion)

    if resultado.get("success"):
        return jsonify(resultado), 200

    return jsonify(resultado), 400

@pedidos_bp.route(
    "/api/pedidos/<int:id_pedido>/cambiar-mesa",
    methods=["PUT"]
)
@jwt_required()
def cambiar_mesa(id_pedido):
    data = request.get_json()
    result = cambiar_mesa_pedido(
        id_pedido,
        data.get("id_mesa_nueva")
    )

    if result.get("success"):
        return jsonify({"mensaje": "Mesa cambiada correctamente"}), 200

    if result.get("error") == "MESA_NO_DISPONIBLE":
        return jsonify({"error": "La mesa no está disponible"}), 409

    return jsonify(result), 400

