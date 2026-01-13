# routes/pedidos_routes.py

from flask import Blueprint, request, jsonify
from controllers.pedidos_controller import (crear_pedido, agregar_detalle_pedido)
from controllers.orden_controller import get_pedidos_activos

pedidos_bp = Blueprint("pedidos_bp", __name__)

@pedidos_bp.route("/api/pedidos", methods=["GET"])
def listar_pedidos():
    return get_pedidos_activos()

@pedidos_bp.route("/api/pedidos", methods=["POST"])
def crear_pedido_route():
    data = request.get_json()
    resultado = crear_pedido(data)

    if resultado.get("success"):
        return jsonify(resultado), 201

    return jsonify(resultado), 500

@pedidos_bp.route("/api/pedidos/<int:id_pedido>/detalle", methods=["POST"])
def agregar_detalle_route(id_pedido):
    data = request.get_json()
    resultado = agregar_detalle_pedido(id_pedido, data)

    if resultado.get("success"):
        return jsonify(resultado), 201

    return jsonify(resultado), 400
