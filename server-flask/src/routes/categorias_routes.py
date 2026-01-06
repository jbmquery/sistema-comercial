# routes/categorias_routes.py
from flask import Blueprint, request, jsonify
from controllers.categorias_controller import obtener_categorias, obtener_subcategorias

categorias_bp = Blueprint('categorias_bp', __name__)

@categorias_bp.route('/api/categorias', methods=['GET'])
def get_categorias():
    categorias = obtener_categorias()
    return jsonify({"categorias": categorias})

@categorias_bp.route('/api/subcategorias', methods=['GET'])
def get_subcategorias():
    categoria_id = request.args.get('categoria')
    if not categoria_id:
        return jsonify({"subcategorias": []})
    try:
        subcategorias = obtener_subcategorias(int(categoria_id))
        return jsonify({"subcategorias": subcategorias})
    except ValueError:
        return jsonify({"subcategorias": []})
    
from controllers.categorias_controller import (
    crear_categoria,
    actualizar_categoria,
    eliminar_categoria,
    crear_subcategoria,
    actualizar_subcategoria,
    eliminar_subcategoria
)

# ===== CATEGORIAS =====

@categorias_bp.route('/api/categorias', methods=['POST'])
def post_categoria():
    data = request.get_json()
    new_id = crear_categoria(data)
    if new_id:
        return jsonify({"success": True, "message": "Categoría creada"})
    return jsonify({"success": False, "message": "Error al crear categoría"}), 500


@categorias_bp.route('/api/categorias/<int:id_categoria>', methods=['PUT'])
def put_categoria(id_categoria):
    if actualizar_categoria(id_categoria, request.get_json()):
        return jsonify({"success": True, "message": "Categoría actualizada"})
    return jsonify({"success": False, "message": "Error al actualizar"}), 500


@categorias_bp.route('/api/categorias/<int:id_categoria>', methods=['DELETE'])
def delete_categoria(id_categoria):
    result = eliminar_categoria(id_categoria)

    if result == "TIENE_SUBCATEGORIAS":
        return jsonify({
            "success": False,
            "message": "No se puede eliminar: tiene subcategorías"
        }), 400

    if result is True:
        return jsonify({"success": True, "message": "Categoría eliminada"})

    return jsonify({"success": False, "message": "Error al eliminar"}), 500


# ===== SUBCATEGORIAS =====

@categorias_bp.route('/api/subcategorias', methods=['POST'])
def post_subcategoria():
    new_id = crear_subcategoria(request.get_json())
    if new_id:
        return jsonify({"success": True, "message": "Subcategoría creada"})
    return jsonify({"success": False, "message": "Error al crear"}), 500


@categorias_bp.route('/api/subcategorias/<int:id_subcat>', methods=['PUT'])
def put_subcategoria(id_subcat):
    if actualizar_subcategoria(id_subcat, request.get_json()):
        return jsonify({"success": True, "message": "Subcategoría actualizada"})
    return jsonify({"success": False, "message": "Error al actualizar"}), 500


@categorias_bp.route('/api/subcategorias/<int:id_subcat>', methods=['DELETE'])
def delete_subcategoria(id_subcat):
    result = eliminar_subcategoria(id_subcat)

    if result == "TIENE_CARTA":
        return jsonify({
            "success": False,
            "message": "No se puede eliminar: tiene productos en carta"
        }), 400

    if result is True:
        return jsonify({"success": True, "message": "Subcategoría eliminada"})

    return jsonify({"success": False, "message": "Error al eliminar"}), 500
