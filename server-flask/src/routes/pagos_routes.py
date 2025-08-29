# routes/pagos_routes.py
from flask import Blueprint, request, jsonify
from controllers.pagos_controller import buscar_clientes_por_dni, obtener_pedidos_entregados, obtener_detalle_pedido

pagos_bp = Blueprint('pagos_bp', __name__)

@pagos_bp.route('/api/clientes/buscar', methods=['GET'])
def buscar_clientes():
    dni = request.args.get('dni', '').strip()
    if not dni:
        return jsonify({"clientes": []})
    
    resultados = buscar_clientes_por_dni(dni)
    return jsonify({"clientes": resultados})

@pagos_bp.route('/api/pedidos/entregados', methods=['GET'])
def get_pedidos_entregados():
    pedidos = obtener_pedidos_entregados()
    return jsonify({"pedidos": pedidos})

@pagos_bp.route('/api/pedidos/<int:id_pedido>/detalle', methods=['GET'])
def get_detalle(id_pedido):
    detalle = obtener_detalle_pedido(id_pedido)
    return jsonify({"detalle": detalle})