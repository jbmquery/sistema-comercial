# server-flask/src/routes/clientes_routes.py
from flask import Blueprint, request, jsonify
from controllers.clientes_controller import (
    obtener_todos_clientes,
    crear_cliente,
    actualizar_cliente,
    eliminar_cliente
)

clientes_bp = Blueprint('clientes_bp', __name__)

@clientes_bp.route('/api/clientes', methods=['GET'])
def get_clientes():
    """
    Endpoint para obtener todos los clientes
    """
    clientes = obtener_todos_clientes()
    return jsonify(clientes), 200

@clientes_bp.route('/api/clientes', methods=['POST'])
def post_cliente():
    """
    Endpoint para crear un nuevo cliente
    """
    cliente = request.get_json()
    
    # Validar campos requeridos
    if not cliente or not cliente.get('nombres') or not cliente.get('dni'):
        return jsonify({"error": "Faltan campos requeridos (nombres y dni)"}), 400
    
    # Validar longitud del DNI
    if len(cliente.get('dni', '')) < 8 or len(cliente.get('dni', '')) > 12:
        return jsonify({"error": "El DNI debe tener entre 8 y 12 caracteres"}), 400
    
    resultado = crear_cliente(cliente)
    if resultado:
        return jsonify(resultado), 201
    return jsonify({"error": "Error al crear cliente"}), 500

@clientes_bp.route('/api/clientes/<int:id_cliente>', methods=['PUT'])
def put_cliente(id_cliente):
    """
    Endpoint para actualizar un cliente existente
    """
    cliente = request.get_json()
    
    # Validar campos requeridos
    if not cliente or not cliente.get('nombres') or not cliente.get('dni'):
        return jsonify({"error": "Faltan campos requeridos (nombres y dni)"}), 400
    
    # Validar longitud del DNI
    if len(cliente.get('dni', '')) < 8 or len(cliente.get('dni', '')) > 12:
        return jsonify({"error": "El DNI debe tener entre 8 y 12 caracteres"}), 400
    
    resultado = actualizar_cliente(id_cliente, cliente)
    if resultado:
        return jsonify(resultado), 200
    return jsonify({"error": "Cliente no encontrado"}), 404

@clientes_bp.route('/api/clientes/<int:id_cliente>', methods=['DELETE'])
def delete_cliente(id_cliente):
    """
    Endpoint para eliminar un cliente
    """
    resultado = eliminar_cliente(id_cliente)
    if resultado:
        return jsonify({"id_cliente": resultado}), 200
    return jsonify({"error": "Cliente no encontrado"}), 404