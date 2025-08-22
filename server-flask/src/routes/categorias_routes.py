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