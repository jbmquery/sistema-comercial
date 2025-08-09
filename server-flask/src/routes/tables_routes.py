from flask import Blueprint, jsonify
from controllers.tables_controller import obtener_mesas

tables_bp = Blueprint('tables_bp', __name__)

@tables_bp.route('/api/mesas', methods=['GET'])
def get_mesas():
    mesas = obtener_mesas()
    return jsonify({"mesas": mesas}), 200
