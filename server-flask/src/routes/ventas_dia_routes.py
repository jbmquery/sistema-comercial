# routes/ventas_dia_routes.py
from flask import Blueprint, jsonify
from controllers.ventas_dia_controller import obtener_ventas_del_dia

ventas_dia_bp = Blueprint('ventas_dia_bp', __name__)

@ventas_dia_bp.route('/api/ventas/dia', methods=['GET'])
def get_ventas_dia():
    """
    Endpoint para obtener todas las ventas del día actual.
    """
    resultado = obtener_ventas_del_dia()
    return jsonify(resultado), 200