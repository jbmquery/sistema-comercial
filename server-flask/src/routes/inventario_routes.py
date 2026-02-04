from flask import Blueprint, request
from controllers.inventario_controller import (
    get_insumos,
    crear_insumo,
    actualizar_insumo,
    eliminar_insumo
)

inventario_bp = Blueprint('inventario_bp', __name__)

# =========================
# GET TODOS
# =========================
@inventario_bp.route('/insumos', methods=['GET'])
def listar_insumos():
    return get_insumos()


# =========================
# POST CREAR
# =========================
@inventario_bp.route('/insumos', methods=['POST'])
def crear():
    data = request.get_json()
    return crear_insumo(data)


# =========================
# PUT ACTUALIZAR
# =========================
@inventario_bp.route('/insumos/<int:id_insumo>', methods=['PUT'])
def actualizar(id_insumo):
    data = request.get_json()
    return actualizar_insumo(id_insumo, data)


# =========================
# DELETE
# =========================
@inventario_bp.route('/insumos/<int:id_insumo>', methods=['DELETE'])
def eliminar(id_insumo):
    return eliminar_insumo(id_insumo)
