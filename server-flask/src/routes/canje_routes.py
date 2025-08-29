# routes/canje_routes.py
from flask import Blueprint, request, jsonify
from controllers.canje_controller import (
    obtener_detalle_con_puntos,
    validar_canje_producto,
    registrar_canje_multiple
)

canje_bp = Blueprint('canje_bp', __name__)

# Obtener detalle del pedido con puntos_canje de la carta
@canje_bp.route('/api/pedidos/<int:id_pedido>/detalle-con-puntos', methods=['GET'])
def get_detalle_con_puntos(id_pedido):
    detalle = obtener_detalle_con_puntos(id_pedido)
    return jsonify({"detalle": detalle})

# Validar si un cliente puede canjear un producto
@canje_bp.route('/api/canje/validar', methods=['POST'])
def validar_canje():
    datos = request.get_json()
    id_cliente = datos.get('id_cliente')
    id_detalle = datos.get('id_detalle')

    resultado = validar_canje_producto(id_cliente, id_detalle)
    return jsonify(resultado)

# Registrar el pago y todos los canjes
@canje_bp.route('/api/pagos/registrar', methods=['POST'])
def registrar_pago():
    datos = request.get_json()
    resultado = registrar_canje_multiple(datos)
    return jsonify(resultado)