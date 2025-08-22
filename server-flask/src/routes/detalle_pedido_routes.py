# routes/detalle_pedido_routes.py
from flask import Blueprint, request, jsonify
from controllers.detalle_pedido_controller import agregar_detalle, actualizar_estado_detalle

detalle_pedido_bp = Blueprint('detalle_pedido_bp', __name__)

@detalle_pedido_bp.route('/api/detalle_pedido', methods=['POST'])
def agregar_detalle_route():
    datos = request.get_json()
    resultado = agregar_detalle(datos)
    return jsonify(resultado), 201 if "id_detalle" in resultado else 400

@detalle_pedido_bp.route('/api/detalle_pedido/actualizar', methods=['PUT'])
def actualizar_estado_detalle_route():
    datos = request.get_json()
    resultado = actualizar_estado_detalle(datos['id_detalle'], datos['estado'])
    return jsonify(resultado), 200 if resultado.get('success') else 400