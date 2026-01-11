from flask import Blueprint
from controllers.orden_controller import pagar_cuenta

orden_bp = Blueprint('orden', __name__)

orden_bp.route(
  '/api/pedidos/<int:id_pedido>/pagar',
  methods=['POST']
)(pagar_cuenta)
