from flask import Blueprint, request, abort, send_file
from controllers.impresiones_controller import (imprimir_cocina, imprimir_voucher_pago)

impresiones_bp = Blueprint("impresiones", __name__)

@impresiones_bp.route("/impresiones/cocina/<int:id_pedido>", methods=["POST"])
def imprimir_cocina_route(id_pedido):
    data = request.get_json()
    detalles = data.get("detalles", [])

    if not detalles:
        abort(400, "No se seleccionó ningún producto")

    pdf_buffer = imprimir_cocina(id_pedido, detalles)

    if not pdf_buffer:
        abort(404, "No hay datos para imprimir")

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=False,
        download_name="cocina.pdf"
    )

@impresiones_bp.route("/impresiones/voucher/<int:id_pedido>", methods=["POST"])
def imprimir_voucher_route(id_pedido):
    data = request.get_json()
    detalles = data.get("detalles", [])

    if not detalles:
        abort(400, "No se seleccionó ningún producto")

    pdf_buffer = imprimir_voucher_pago(id_pedido, detalles)

    if not pdf_buffer:
        abort(404, "No hay datos para imprimir")

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=False,
        download_name="voucher_pago.pdf"
    )