# server-flask/src/routes/proveedores_routes.py
from flask import Blueprint, request
from controllers.proveedores_controller import (
    get_proveedores,
    crear_proveedor,
    actualizar_proveedor,
    eliminar_proveedor
)

proveedores_bp = Blueprint('proveedores_bp', __name__)

@proveedores_bp.route('/proveedores', methods=['GET'])
def listar():
    return get_proveedores()

@proveedores_bp.route('/proveedores', methods=['POST'])
def crear():
    return crear_proveedor(request.get_json())

@proveedores_bp.route('/proveedores/<int:id>', methods=['PUT'])
def actualizar(id):
    return actualizar_proveedor(id, request.get_json())

@proveedores_bp.route('/proveedores/<int:id>', methods=['DELETE'])
def eliminar(id):
    return eliminar_proveedor(id)
