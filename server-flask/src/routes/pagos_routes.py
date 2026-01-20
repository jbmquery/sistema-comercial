#server-flask/src/routes/pagos_routes.py
from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.pagos_controller import pagar_cuenta

pagos_bp = Blueprint('pagos', __name__)

@pagos_bp.route('/api/pedidos/<int:id_pedido>/pagar', methods=['POST'])
@jwt_required()
def pagar_cuenta_route(id_pedido):
    return pagar_cuenta(id_pedido)
