from flask import Blueprint, request
from controllers.carta_controller import get_carta

carta_bp = Blueprint("carta", __name__)

@carta_bp.route("/api/carta", methods=["GET"])
def carta_endpoint():
    categoria = request.args.get("categoria")
    search = request.args.get("search", "")
    return get_carta(categoria, search)
