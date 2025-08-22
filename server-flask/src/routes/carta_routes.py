# routes/carta_routes.py
from flask import Blueprint, request, jsonify
from controllers.carta_controller import obtener_productos_por_categoria_y_subcategoria

carta_bp = Blueprint('carta_bp', __name__)

@carta_bp.route('/api/carta', methods=['GET'])
def get_carta():
    categoria = request.args.get('categoria')
    sub_categoria = request.args.get('sub_categoria')

    productos = obtener_productos_por_categoria_y_subcategoria(categoria, sub_categoria)
    return jsonify({"por_subcategoria": productos})  # ← Clave correcta