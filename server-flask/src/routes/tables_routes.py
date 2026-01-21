# server-flask/src/routes/tables_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from controllers.tables_controller import (
    obtener_mesas,
    crear_mesa,
    actualizar_mesa,
    eliminar_mesa
)

tables_bp = Blueprint('tables_bp', __name__)

@tables_bp.route('/api/mesas', methods=['GET'])
@jwt_required()
def get_mesas():
    mesas = obtener_mesas()
    return jsonify({"mesas": mesas}), 200


@tables_bp.route('/api/mesas', methods=['POST'])
@jwt_required()
def post_mesa():
    mesa = request.get_json()
    id_mesa = crear_mesa(mesa)
    if id_mesa:
        return jsonify({"id_mesas": id_mesa}), 201
    return jsonify({"error": "Error al crear mesa"}), 500


@tables_bp.route('/api/mesas/<int:id_mesa>', methods=['PUT'])
@jwt_required()
def put_mesa(id_mesa):
    mesa = request.get_json()
    result = actualizar_mesa(id_mesa, mesa)

    if result.get("success"):
        return jsonify(result), 200

    if result.get("error") == "PEDIDO_ABIERTO":
        return jsonify({
            "error": "Hay un pedido aun abierto y no se puede cambiar el estado"
        }), 409

    return jsonify({"error": "Error al actualizar mesa"}), 500


@tables_bp.route('/api/mesas/<int:id_mesa>', methods=['DELETE'])
@jwt_required()
def delete_mesa(id_mesa):
    result = eliminar_mesa(id_mesa)

    if result.get("success"):
        return jsonify(result), 200

    if result.get("error") == "PEDIDO_ABIERTO":
        return jsonify({
            "error": "Hay un pedido aun abierto y no se puede eliminar la mesa"
        }), 409

    return jsonify({"error": "Error al eliminar mesa"}), 500
