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
            c.unidad_medida,
            d.id_detalle_padre
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
        "unidad_medida": r[7],
        "id_detalle_padre": r[8]
    } for r in rows]

    cur.close()
    conn.close()

    return jsonify(detalles)

def get_toppings():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            c.id_carta,
            c.nombre,
            c.precio
        FROM carta c
        JOIN categorias cat ON cat.id_categoria = c.categoria
        WHERE cat.nombre_cat = 'Toppings'
            AND c.estado = true
            AND c.disponible = true
        ORDER BY c.nombre
    """)

    rows = cur.fetchall()

    toppings = [{
        "id_carta": r[0],
        "nombre": r[1],
        "precio": float(r[2])
    } for r in rows]

    cur.close()
    conn.close()

    return jsonify(toppings)

def actualizar_detalle_producto(id_detalle):
    data = request.json
    observacion = data.get("observacion")
    toppings_ids = data.get("toppings", [])

    conn = get_connection()
    cur = conn.cursor()

    # 1. Actualizar observación
    cur.execute("""
        UPDATE detalle_pedido
        SET observacion = %s
        WHERE id_detalle = %s
    """, (observacion, id_detalle))

    # 2. Obtener toppings actuales
    cur.execute("""
        SELECT id_detalle, id_carta
        FROM detalle_pedido
        WHERE id_detalle_padre = %s
    """, (id_detalle,))

    actuales = cur.fetchall()
    actuales_map = {r[1]: r[0] for r in actuales}

    # 3. Eliminar los que ya no vienen
    for id_carta, id_det in actuales_map.items():
        if id_carta not in toppings_ids:
            cur.execute("""
                DELETE FROM detalle_pedido
                WHERE id_detalle = %s
            """, (id_det,))

    # 4. Insertar nuevos
    for id_carta in toppings_ids:
        if id_carta not in actuales_map:
            cur.execute("""
                INSERT INTO detalle_pedido
                (id_pedido, id_carta, cantidad, precio_unitario, estado, cuenta, id_detalle_padre)
                SELECT id_pedido, %s, 1, precio_unitario, 'pendiente', cuenta, %s
                FROM detalle_pedido
                WHERE id_detalle = %s
            """, (id_carta, id_detalle, id_detalle))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"mensaje": "Producto actualizado correctamente"})

