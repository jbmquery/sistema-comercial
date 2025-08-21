from flask import Blueprint, request, jsonify
from controllers.pedido_controller import crear_pedido

pedido_bp = Blueprint('pedido_bp', __name__)

@pedido_bp.route('/api/pedidos', methods=['POST'])
def crear_pedido_route():
    datos = request.get_json()
    resultado = crear_pedido(datos)
    return jsonify(resultado), 201 if "id_pedido" in resultado else 400