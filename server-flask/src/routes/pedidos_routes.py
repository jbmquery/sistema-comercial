from flask import Blueprint, jsonify, request
from controllers.pedidos_controller import obtener_pedidos_activos
from controllers.pedidos_controller import cancelar_pedido

pedidos_bp = Blueprint('pedidos_bp', __name__)

@pedidos_bp.route('/api/pedidos/activos', methods=['GET'])
def get_pedidos_activos():
    pedidos = obtener_pedidos_activos()
    return jsonify(pedidos)

@pedidos_bp.route('/api/pedidos/cancelar', methods=['POST'])
def cancelar_pedido_route():
    datos = request.get_json()
    resultado = cancelar_pedido(datos['id_pedido'])
    return jsonify(resultado), 200 if resultado.get('success') else 400