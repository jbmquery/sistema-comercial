from flask import Blueprint, request, jsonify
from controllers.ventas_dia_controller import (
    get_productos_vendidos_por_dia,
    get_productos_perdida_por_dia,
    get_tipos_venta_por_dia,
    get_ventas_por_mesa_dia,
    get_resumen_pedidos_por_dia,
    get_caja_dia,
    get_detalle_pedido_ventas_page
    )

ventas_dia_bp = Blueprint('ventas_dia', __name__)

@ventas_dia_bp.route('/api/ventas-dia/productos', methods=['GET'])
def productos_vendidos():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_productos_vendidos_por_dia(fecha)
    return jsonify({"productos_vendidos": data})

@ventas_dia_bp.route('/api/ventas-dia/perdidas', methods=['GET'])
def productos_perdida():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_productos_perdida_por_dia(fecha)
    return jsonify({"productos_perdida": data})

@ventas_dia_bp.route('/api/ventas-dia/tipos-venta', methods=['GET'])
def tipos_venta_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_tipos_venta_por_dia(fecha)
    return jsonify({"tipos_venta": data})

@ventas_dia_bp.route('/api/ventas-dia/mesas', methods=['GET'])
def ventas_por_mesa_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_ventas_por_mesa_dia(fecha)
    return jsonify({"ventas_mesas": data})

@ventas_dia_bp.route('/api/ventas-dia/resumen-pedidos', methods=['GET'])
def resumen_pedidos_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_resumen_pedidos_por_dia(fecha)
    return jsonify({"resumen_pedidos": data})

@ventas_dia_bp.route('/api/ventas-dia/caja', methods=['GET'])
def caja_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha"}), 400

    data = get_caja_dia(fecha)
    return jsonify({"caja": data})

@ventas_dia_bp.route('/api/ventas-dia/pedido-detalle/<int:id_pedido>', methods=['GET'])
def pedido_detalle(id_pedido):
    data = get_detalle_pedido_ventas_page(id_pedido)
    return jsonify(data)


