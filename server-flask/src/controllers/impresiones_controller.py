from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from io import BytesIO
from datetime import datetime
from conexion_postgresql import get_connection
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os


# =====================================================
# ============ UTILIDAD PARA SALTO DE LÍNEA ===========
# =====================================================

def wrap_text(pdf, texto, max_width, font_name, font_size):
    """
    Divide un texto en varias líneas para que no se salga del ancho del ticket.
    """
    pdf.setFont(font_name, font_size)

    palabras = texto.split(" ")
    lineas = []
    linea_actual = ""

    for palabra in palabras:
        prueba = linea_actual + (" " if linea_actual else "") + palabra

        if pdf.stringWidth(prueba, font_name, font_size) <= max_width:
            linea_actual = prueba
        else:
            lineas.append(linea_actual)
            linea_actual = palabra

    if linea_actual:
        lineas.append(linea_actual)

    return lineas


# =====================================================
# ================ IMPRESIÓN COCINA ===================
# =====================================================

def imprimir_cocina(id_pedido, detalles_ids):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # ---------- REGISTRO DE FUENTES COURIER ----------
    font_regular = os.path.join(BASE_DIR, "..", "fonts", "cour.ttf")
    font_bold = os.path.join(BASE_DIR, "..", "fonts", "courbd.ttf")
    font_italic = os.path.join(BASE_DIR, "..", "fonts", "couri.ttf")

    pdfmetrics.registerFont(TTFont("CourierNew", font_regular))
    pdfmetrics.registerFont(TTFont("CourierNew-Bold", font_bold))
    pdfmetrics.registerFont(TTFont("CourierNew-Italic", font_italic))

    if not detalles_ids:
        return None

    detalles_tuple = tuple(detalles_ids)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            m.nombre AS mesa,
            p.id_pedido,
            c.nombre,
            d.observacion,
            c.porcion,
            c.unidad_medida
        FROM detalle_pedido d
        JOIN pedidos p ON p.id_pedido = d.id_pedido
        JOIN mesas m ON m.id_mesas = p.id_mesa
        JOIN carta c ON c.id_carta = d.id_carta
        WHERE d.id_detalle IN %s
        ORDER BY d.id_detalle
    """, (detalles_tuple,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return None

    width = 57 * mm
    line_height = 12

    header_lines = 7
    product_lines = 0

    for _, _, _, obs, _, _ in rows:
        product_lines += 1
        if obs:
            product_lines += 1

    total_lines = header_lines + product_lines
    top_margin = 20
    bottom_margin = ((total_lines - 1) * 3) + 5

    height = (
        top_margin +
        total_lines * line_height +
        bottom_margin
    )

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(width, height))
    y = height - top_margin

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(width / 2, y, "PLUVIA CAFÉ")
    y -= line_height

    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawCentredString(width / 2, y, "Café amor y barrio")
    y -= line_height * 1.5

    mesa, pedido = rows[0][0], rows[0][1]
    fecha = datetime.now().strftime("%d/%m/%Y")
    hora = datetime.now().strftime("%I:%M %p")

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(5, y, mesa)
    pdf.drawRightString(width - 5, y, f"Pedido: {pedido}")
    y -= line_height

    pdf.setFont("Helvetica", 8)
    pdf.drawString(5, y, f"{fecha}  {hora}")
    y -= line_height

    pdf.line(5, y, width - 5, y)
    y -= line_height

    # ============ AQUÍ ESTÁ EL CAMBIO IMPORTANTE ============
    for _, _, producto, obs, porcion, unidad_medida in rows:

        pdf.setFont("Helvetica-Bold", 11)

        texto_producto = f"- {producto}"
        if porcion is not None:
            texto_producto += f" ({porcion} {unidad_medida})"

        # ----- SALTO DE LÍNEA AUTOMÁTICO -----
        lineas_producto = wrap_text(
            pdf,
            texto_producto,
            width - 10,
            "Helvetica-Bold",
            10
        )

        for linea in lineas_producto:
            pdf.drawString(5, y, linea)
            y -= line_height

        if obs:
            pdf.setFont("Helvetica-Oblique", 9)

            lineas_obs = wrap_text(
                pdf,
                obs,
                width - 15,
                "Helvetica-Oblique",
                8
            )

            for linea in lineas_obs:
                pdf.drawString(10, y, linea)
                y -= line_height

        y -= 4
    # =======================================================

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer


# =====================================================
# =============== VOUCHER DE PAGO =====================
# =====================================================

def imprimir_voucher_pago(id_pedido, detalles_ids):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    font_regular = os.path.join(BASE_DIR, "..", "fonts", "cour.ttf")
    font_bold = os.path.join(BASE_DIR, "..", "fonts", "courbd.ttf")
    font_italic = os.path.join(BASE_DIR, "..", "fonts", "couri.ttf")

    pdfmetrics.registerFont(TTFont("CourierNew", font_regular))
    pdfmetrics.registerFont(TTFont("CourierNew-Bold", font_bold))
    pdfmetrics.registerFont(TTFont("CourierNew-Italic", font_italic))

    if not detalles_ids:
        return None

    detalles_tuple = tuple(detalles_ids)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.numero_orden,
            c.abreviado,
            d.precio_unitario,
            COUNT(*) as cantidad,
            c.porcion,
            c.unidad_medida
        FROM detalle_pedido d
        JOIN pedidos p ON p.id_pedido = d.id_pedido
        JOIN carta c ON c.id_carta = d.id_carta
        WHERE d.id_detalle IN %s
        GROUP BY p.numero_orden, c.abreviado, d.precio_unitario, c.porcion, c.unidad_medida
        ORDER BY c.abreviado
    """, (detalles_tuple,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return None

    width = 57 * mm

    LINE = 12
    HEADER_HEIGHT = 140
    ITEM_HEIGHT = 12
    BOTTOM_MARGIN = 70
    TOP_PADDING = 20

    height = (
        HEADER_HEIGHT +
        len(rows) * ITEM_HEIGHT +
        BOTTOM_MARGIN
    )

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(width, height))
    y = height - TOP_PADDING

    logo_path = os.path.join(BASE_DIR, "..", "img", "loguito2.jpg")
    img = ImageReader(logo_path)

    pdf.drawImage(
        img,
        (width - 50) / 2,
        y - 50,
        width=50,
        height=50,
        preserveAspectRatio=True,
        mask='auto'
    )
    y -= 45

    y -= LINE * 1.5

    pdf.setFont("Helvetica-Oblique", 8)
    pdf.drawCentredString(width / 2, y, "Café, amor y barrio")
    y -= LINE * 1.5

    pedido = rows[0][0]
    fecha = datetime.now().strftime("%d/%m/%Y")
    hora = datetime.now().strftime("%I:%M:%S %p")

    pdf.setFont("Helvetica", 8)
    pdf.drawString(5, y, f"Código de pedido: {pedido}")
    y -= LINE

    pdf.drawString(5, y, f"F: {fecha} - H: {hora}")
    y -= LINE

    pdf.line(5, y, width - 5, y)
    y -= LINE

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(5, y, "Detalle del Pedido")
    y -= LINE

    total_pagar = 0
    pdf.setFont("Helvetica", 8)

    for _, abreviado, precio, cantidad, porcion, unidad_medida in rows:
        subtotal = precio * cantidad
        total_pagar += subtotal

        texto_izq = f"{cantidad} x {abreviado}"

        if porcion is not None:
            texto_izq += f" ({porcion} {unidad_medida})"

        MAX_CHARS = 28
        if len(texto_izq) > MAX_CHARS:
            texto_izq = texto_izq[:MAX_CHARS - 3] + "..."

        texto_der = f"S/ {subtotal:.2f}"

        pdf.drawString(5, y, texto_izq)
        pdf.drawRightString(width - 5, y, texto_der)

        y -= ITEM_HEIGHT

    y -= 5
    pdf.line(5, y, width - 5, y)
    y -= LINE

    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawRightString(
        width - 5,
        y,
        f"Total a pagar: S/ {total_pagar:.2f}"
    )
    y -= LINE * 1.5

    pdf.setFont("Helvetica-Oblique", 8)
    pdf.drawCentredString(width / 2, y, "¡Esperamos verte pronto!")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer
