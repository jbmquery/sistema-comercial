from flask import Blueprint
from controllers.cuenta_controller import obtener_cuenta_actual

cuenta_routes = Blueprint('cuenta_routes', __name__)


@cuenta_routes.route('/pedidos/<int:id_pedido>/cuenta-actual', methods=['GET'])
def cuenta_actual(id_pedido):
    return obtener_cuenta_actual(id_pedido)
