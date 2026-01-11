from flask import request, jsonify
from conexion_postgresql import get_connection



def pagar_cuenta(id_pedido):
    data = request.json
    cuenta = data['cuenta']
    detalles = data['detalles']
    pagos = data['pagos']

    conn = get_connection()
    cur = conn.cursor()

    try:
        # 1️⃣ Calcular total real desde BD
        cur.execute("""
            SELECT SUM(precio_unitario)
            FROM detalle_pedido
            WHERE id_detalle = ANY(%s)
              AND estado = 'pendiente'
              AND id_pedido = %s
        """, (detalles, id_pedido))

        total_db = cur.fetchone()[0] or 0

        total_pagado = sum(p['monto'] for p in pagos)

        if float(total_db) != float(total_pagado):
            return jsonify({
                "error": "El monto pagado no coincide con el total"
            }), 400

        # 2️⃣ Registrar pagos (pueden ser varios)
        for pago in pagos:
            cur.execute("""
                INSERT INTO pagos (id_pedido, cuenta, monto_total, metodo_pago)
                VALUES (%s, %s, %s, %s)
            """, (
                id_pedido,
                cuenta,
                pago['monto'],
                pago['metodo']
            ))

        # 3️⃣ Marcar detalles como pagados
        cur.execute("""
            UPDATE detalle_pedido
            SET estado = 'pagado',
                cuenta = %s
            WHERE id_detalle = ANY(%s)
        """, (cuenta, detalles))

        conn.commit()

        return jsonify({
            "ok": True,
            "cuenta_pagada": cuenta
        })

    except Exception as e:
        conn.rollback()
        return jsonify({ "error": str(e) }), 500

    finally:
        cur.close()
        conn.close()

def get_pedido_detalle(id_pedido):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            d.id_detalle,
            d.cuenta,
            d.estado,
            d.precio_unitario,
            d.observacion,
            c.nombre
        FROM detalle_pedido d
        JOIN carta c ON c.id_carta = d.id_carta
        WHERE d.id_pedido = %s
        ORDER BY d.id_detalle
    """, (id_pedido,))

    rows = cur.fetchall()

    detalles = [{
        "id_detalle": r[0],
        "cuenta": r[1],
        "estado": r[2],
        "precio": float(r[3]),
        "observacion": r[4],
        "nombre": r[5]
    } for r in rows]

    return jsonify(detalles)

def get_pedidos_activos():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.id_pedido,
            p.id_mesa,
            m.nombre AS mesa
        FROM pedidos p
        JOIN mesas m ON m.id_mesa = p.id_mesa
        WHERE p.estado = 'abierto'
        ORDER BY p.id_pedido DESC
    """)

    rows = cur.fetchall()

    pedidos = [{
        "id_pedido": r[0],
        "id_mesa": r[1],
        "mesa": r[2]
    } for r in rows]

    cur.close()
    conn.close()

    return jsonify(pedidos)
