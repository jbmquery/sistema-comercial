# routes/dividir_producto_routes.py
from flask import Blueprint, request, jsonify
from controllers.dividir_producto_controller import dividir_detalle_pedido

dividir_bp = Blueprint('dividir_bp', __name__)

@dividir_bp.route('/api/detalle_pedido/dividir', methods=['POST'])
def dividir_detalle():
    datos = request.get_json()
    id_detalle = datos.get('id_detalle')

    resultado = dividir_detalle_pedido(id_detalle)
    return jsonify(resultado), 200 if resultado.get('success') else 400