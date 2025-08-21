# routes/detalle_pedido_routes.py
from flask import Blueprint, request, jsonify
from controllers.detalle_pedido_controller import agregar_detalle

detalle_pedido_bp = Blueprint('detalle_pedido_bp', __name__)

@detalle_pedido_bp.route('/api/detalle_pedido', methods=['POST'])
def agregar_detalle_route():
    datos = request.get_json()
    resultado = agregar_detalle(datos)
    return jsonify(resultado), 201 if "id_detalle" in resultado else 400