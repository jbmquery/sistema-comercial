from flask import Blueprint
from controllers.orden_controller import (get_pedido_detalle)

orden_bp = Blueprint('orden', __name__)

orden_bp.route('/api/pedidos/<int:id_pedido>', methods=['GET'])(get_pedido_detalle)
