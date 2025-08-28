# routes/pagos_routes.py
from flask import Blueprint, request, jsonify
from controllers.pagos_controller import buscar_clientes_por_dni

pagos_bp = Blueprint('pagos_bp', __name__)

@pagos_bp.route('/api/clientes/buscar', methods=['GET'])
def buscar_clientes():
    dni = request.args.get('dni', '').strip()
    if not dni:
        return jsonify({"clientes": []})
    
    resultados = buscar_clientes_por_dni(dni)
    return jsonify({"clientes": resultados})