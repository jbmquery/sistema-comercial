#server-flask/src/routes/orden_routes.py
from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.orden_controller import (
    get_pedido_detalle,
    get_toppings,
    actualizar_detalle_producto
)


orden_bp = Blueprint('orden', __name__)

#orden_bp.route('/api/pedidos/<int:id_pedido>', methods=['GET'])(get_pedido_detalle)
@orden_bp.route('/api/pedidos/<int:id_pedido>', methods=['GET'])
@jwt_required()
def pedido_detalle_route(id_pedido):
    return get_pedido_detalle(id_pedido)

@orden_bp.route('/api/toppings', methods=['GET'])
@jwt_required()
def toppings_route():
    return get_toppings()

@orden_bp.route('/api/detalle/<int:id_detalle>', methods=['PUT'])
@jwt_required()
def actualizar_detalle_route(id_detalle):
    return actualizar_detalle_producto(id_detalle)

