from flask import Blueprint, jsonify
from controllers.pedidos_controller import obtener_pedidos_activos

pedidos_bp = Blueprint('pedidos_bp', __name__)

@pedidos_bp.route('/api/pedidos/activos', methods=['GET'])
def get_pedidos_activos():
    pedidos = obtener_pedidos_activos()
    return jsonify(pedidos)