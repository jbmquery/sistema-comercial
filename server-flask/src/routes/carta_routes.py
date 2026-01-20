#server-flask/src/routes/carta_routes.py
from flask import Blueprint, request, jsonify
from controllers.carta_controller import obtener_productos_por_categoria_y_subcategoria
from controllers.carta_controller import (
    crear_carta,
    actualizar_carta,
    eliminar_carta
)

carta_bp = Blueprint('carta_bp', __name__)

@carta_bp.route('/api/carta', methods=['GET'])
def get_carta():
    categoria = request.args.get('categoria')
    sub_categoria = request.args.get('sub_categoria')
    search = request.args.get('search', '').strip()

    productos = obtener_productos_por_categoria_y_subcategoria(categoria, sub_categoria, search)
    return jsonify({"por_subcategoria": productos})  # ← Clave correcta



@carta_bp.route('/api/carta', methods=['POST'])
def post_carta():
    if crear_carta(request.get_json()):
        return jsonify({"success": True, "message": "Producto creado"})
    return jsonify({"success": False, "message": "Error al crear producto"}), 500


@carta_bp.route('/api/carta/<int:id_carta>', methods=['PUT'])
def put_carta(id_carta):
    if actualizar_carta(id_carta, request.get_json()):
        return jsonify({"success": True, "message": "Producto actualizado"})
    return jsonify({"success": False, "message": "Error al actualizar"}), 500


@carta_bp.route('/api/carta/<int:id_carta>', methods=['DELETE'])
def delete_carta(id_carta):
    if eliminar_carta(id_carta):
        return jsonify({"success": True, "message": "Producto eliminado"})
    return jsonify({"success": False, "message": "Error al eliminar"}), 500
