#server-flask/src/routes/pagos_routes.py
from flask import Blueprint
from controllers.pagos_controller import pagar_cuenta

pagos_bp = Blueprint('pagos', __name__)

pagos_bp.route(
    '/api/pedidos/<int:id_pedido>/pagar',
    methods=['POST']
)(pagar_cuenta)
