from flask import request, jsonify
from conexion_postgresql import get_connection

def get_pedidos_activos():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.id_pedido,
            m.nombre AS mesa
        FROM pedidos p
        JOIN mesas m ON m.id_mesas = p.id_mesa
        WHERE p.estado = 'abierto'
        ORDER BY p.id_pedido DESC
    """)

    rows = cur.fetchall()

    pedidos = [{
        "id_pedido": r[0],
        "mesa": r[1]
    } for r in rows]

    cur.close()
    conn.close()

    return jsonify(pedidos)

def get_pedido_detalle(id_pedido):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            d.id_detalle,
            d.cuenta,
            d.estado,
            d.precio_unitario,
            d.observacion,
            c.nombre,
            c.porcion,
            c.unidad_medida
        FROM detalle_pedido d
        JOIN carta c ON c.id_carta = d.id_carta
        WHERE d.id_pedido = %s
            AND d.estado = 'pendiente'
        ORDER BY d.id_detalle
    """, (id_pedido,))

    rows = cur.fetchall()

    detalles = [{
        "id_detalle": r[0],
        "cuenta": r[1],
        "estado": r[2],
        "precio": float(r[3]),
        "observacion": r[4],
        "nombre": r[5],
        "porcion": r[6],
        "unidad_medida": r[7]
    } for r in rows]

    cur.close()
    conn.close()

    return jsonify(detalles)