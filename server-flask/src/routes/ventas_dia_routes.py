# server-flask/src/routes/ventas_dia_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.ventas_dia_controller import (
    get_productos_vendidos_por_dia,
    get_productos_perdida_por_dia,
    get_tipos_venta_por_dia,
    get_ventas_por_mesa_dia,
    get_resumen_pedidos_por_dia,
    get_caja_dia,
    get_detalle_pedido_ventas_page,
    crear_registro_costo,
    get_costos_dia,
    get_insumos_distinct
    )

ventas_dia_bp = Blueprint('ventas_dia', __name__)

@ventas_dia_bp.route('/api/ventas-dia/productos', methods=['GET'])
@jwt_required()
def productos_vendidos():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_productos_vendidos_por_dia(fecha)
    return jsonify({"productos_vendidos": data})

@ventas_dia_bp.route('/api/ventas-dia/perdidas', methods=['GET'])
@jwt_required()
def productos_perdida():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_productos_perdida_por_dia(fecha)
    return jsonify({"productos_perdida": data})

@ventas_dia_bp.route('/api/ventas-dia/tipos-venta', methods=['GET'])
@jwt_required()
def tipos_venta_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_tipos_venta_por_dia(fecha)
    return jsonify({"tipos_venta": data})

@ventas_dia_bp.route('/api/ventas-dia/mesas', methods=['GET'])
@jwt_required()
def ventas_por_mesa_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_ventas_por_mesa_dia(fecha)
    return jsonify({"ventas_mesas": data})

@ventas_dia_bp.route('/api/ventas-dia/resumen-pedidos', methods=['GET'])
@jwt_required()
def resumen_pedidos_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha (YYYY-MM-DD)"}), 400

    data = get_resumen_pedidos_por_dia(fecha)
    return jsonify({"resumen_pedidos": data})

@ventas_dia_bp.route('/api/ventas-dia/caja', methods=['GET'])
@jwt_required()
def caja_dia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({"error": "Falta parámetro fecha"}), 400

    data = get_caja_dia(fecha)
    return jsonify({"caja": data})

@ventas_dia_bp.route('/api/ventas-dia/pedido-detalle/<int:id_pedido>', methods=['GET'])
@jwt_required()
def pedido_detalle(id_pedido):
    data = get_detalle_pedido_ventas_page(id_pedido)
    return jsonify(data)


@ventas_dia_bp.route('/api/ventas-dia/costos', methods=['GET'])
@jwt_required()
def costos_dia():
    fecha = request.args.get('fecha')
    data = get_costos_dia(fecha)
    return jsonify({"costos": data})

@ventas_dia_bp.route('/api/ventas-dia/costos', methods=['POST'])
@jwt_required()
def crear_costo():
    data = request.json
    id_usuario = get_jwt_identity()

    result = crear_registro_costo(data, id_usuario)
    return jsonify(result), 201

@ventas_dia_bp.route('/api/ventas-dia/insumos-distinct', methods=['GET'])
@jwt_required()
def insumos_distinct():
    data = get_insumos_distinct()
    return jsonify({"insumos": data})
