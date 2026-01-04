from flask import Blueprint, request, jsonify
from controllers.tables_controller import (
    obtener_mesas,
    crear_mesa,
    actualizar_mesa,
    eliminar_mesa
)

tables_bp = Blueprint('tables_bp', __name__)

@tables_bp.route('/api/mesas', methods=['GET'])
def get_mesas():
    mesas = obtener_mesas()
    return jsonify({"mesas": mesas}), 200


@tables_bp.route('/api/mesas', methods=['POST'])
def post_mesa():
    mesa = request.get_json()
    id_mesa = crear_mesa(mesa)
    if id_mesa:
        return jsonify({"id_mesas": id_mesa}), 201
    return jsonify({"error": "Error al crear mesa"}), 500


@tables_bp.route('/api/mesas/<int:id_mesa>', methods=['PUT'])
def put_mesa(id_mesa):
    mesa = request.get_json()
    if actualizar_mesa(id_mesa, mesa):
        return jsonify({"success": True}), 200
    return jsonify({"error": "Error al actualizar mesa"}), 500


@tables_bp.route('/api/mesas/<int:id_mesa>', methods=['DELETE'])
def delete_mesa(id_mesa):
    if eliminar_mesa(id_mesa):
        return jsonify({"success": True}), 200
    return jsonify({"error": "Error al eliminar mesa"}), 500
