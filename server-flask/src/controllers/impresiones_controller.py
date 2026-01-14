from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from io import BytesIO
from datetime import datetime
from conexion_postgresql import get_connection
import os


def imprimir_cocina(id_pedido, detalles_ids):
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
            d.observacion
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

    # =========================
    # 📐 CONFIGURACIÓN BASE
    # =========================
    width = 57 * mm
    line_height = 12

    # =========================
    # 📊 CÁLCULO REAL DE ALTURA
    # =========================

    header_lines = 7  # título, slogan, mesa/pedido, fecha, separador
    product_lines = 0

    for _, _, _, obs in rows:
        product_lines += 1          # nombre producto
        if obs:
            product_lines += 1      # observación

    total_lines = header_lines + product_lines

    top_margin = 20
    bottom_margin = ((total_lines - 1)*2)+5

    height = (
        top_margin +
        total_lines * line_height +
        bottom_margin
    )
    print("Altura del PDF:", height)
    # =========================
    # 🧾 CREACIÓN PDF
    # =========================
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(width, height))

    y = height - top_margin

    # =========================
    # HEADER
    # =========================
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(width / 2, y, "PLUVIA CAFÉ")
    y -= line_height

    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawCentredString(width / 2, y, "café amor y barrio")
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

    # =========================
    # PRODUCTOS
    # =========================
    for _, _, producto, obs in rows:
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(5, y, f"- {producto}")
        y -= line_height

        if obs:
            pdf.setFont("Helvetica", 8)
            pdf.drawString(10, y, obs)
            y -= line_height

        y -= 4  # separación visual (no cuenta como línea)

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer


def imprimir_voucher_pago(id_pedido, detalles_ids):
    if not detalles_ids:
        return None

    detalles_tuple = tuple(detalles_ids)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.numero_orden,
            c.nombre,
            d.precio_unitario,
            COUNT(*) as cantidad
        FROM detalle_pedido d
        JOIN pedidos p ON p.id_pedido = d.id_pedido
        JOIN carta c ON c.id_carta = d.id_carta
        WHERE d.id_detalle IN %s
        GROUP BY p.numero_orden, c.nombre, d.precio_unitario
        ORDER BY c.nombre
    """, (detalles_tuple,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return None

    # =========================
    # 📐 CONFIGURACIÓN
    # =========================
    width = 57 * mm

    LINE = 12
    HEADER_HEIGHT = 140
    ITEM_HEIGHT = 12
    BOTTOM_MARGIN = 30
    TOP_PADDING = 20

    total_items = len(rows)

    height = (
        HEADER_HEIGHT +
        total_items * ITEM_HEIGHT +
        BOTTOM_MARGIN
    )

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(width, height))

    y = height - TOP_PADDING

    # =========================
    # LOGO (opcional)
    # =========================
    logo_path = "../src/img/loguito.png"  # cambia si deseas
    if os.path.exists(logo_path):
        pdf.drawImage(
            logo_path,
            (width - 40) / 2,
            y - 40,
            width=40,
            height=40,
            preserveAspectRatio=True,
            mask='auto'
        )
        y -= 45

    # =========================
    # HEADER
    # =========================
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(width / 2, y, "PLUVIA CAFÉ")
    y -= LINE

    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawCentredString(width / 2, y, "Café, amor y barrio")
    y -= LINE * 1.5

    pedido = rows[0][0]
    fecha = datetime.now().strftime("%d/%m/%Y")
    hora = datetime.now().strftime("%I:%M:%S %p")

    pdf.setFont("Helvetica", 8)
    pdf.drawString(5, y, f"N° de pedido: {pedido}")
    y -= LINE

    pdf.drawString(5, y, f"F: {fecha} - H: {hora}")
    y -= LINE

    pdf.line(5, y, width - 5, y)
    y -= LINE

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(5, y, "Detalle del Pedido")
    y -= LINE

    # =========================
    # DETALLE
    # =========================
    total_pagar = 0

    pdf.setFont("Helvetica", 8)

    for _, nombre, precio, cantidad in rows:
        subtotal = precio * cantidad
        total_pagar += subtotal

        texto = f"{cantidad} x {nombre} - S/ {subtotal:.2f}"
        pdf.drawString(5, y, texto)
        y -= ITEM_HEIGHT

    y -= 5
    pdf.line(5, y, width - 5, y)
    y -= LINE

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawRightString(
        width - 5,
        y,
        f"Total a pagar: S/ {total_pagar:.2f}"
    )
    y -= LINE * 1.5

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawCentredString(width / 2, y, "¡Esperamos verte pronto!")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer

