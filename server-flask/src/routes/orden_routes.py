#server-flask/src/routes/orden_routes.py
from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.orden_controller import (get_pedido_detalle)

orden_bp = Blueprint('orden', __name__)

#orden_bp.route('/api/pedidos/<int:id_pedido>', methods=['GET'])(get_pedido_detalle)
@orden_bp.route('/api/pedidos/<int:id_pedido>', methods=['GET'])
@jwt_required()
def pedido_detalle_route(id_pedido):
    return get_pedido_detalle(id_pedido)
