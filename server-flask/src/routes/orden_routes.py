from flask import Blueprint
from controllers.orden_controller import pagar_cuenta
from controllers.orden_controller import pagar_cuenta, get_pedidos_activos

orden_bp = Blueprint('orden', __name__)

orden_bp.route(
  '/api/pedidos/<int:id_pedido>/pagar',
  methods=['POST']
)(pagar_cuenta)


orden_bp.route(
  '/api/pedidos',
  methods=['GET']
)(get_pedidos_activos)

