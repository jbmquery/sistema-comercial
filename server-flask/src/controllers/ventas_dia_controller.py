#ventas_dia_controller.py

from conexion_postgresql import get_connection

def get_productos_vendidos_por_dia(fecha):
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT 
        c.id_carta,
        c.nombre,
        c.porcion,
        c.unidad_medida,
        COUNT(dp.id_detalle) AS cantidad,
        SUM(dp.precio_unitario) AS monto
    FROM detalle_pedido dp
    INNER JOIN pedidos p 
    ON dp.id_pedido = p.id_pedido
    INNER JOIN carta c
    ON dp.id_carta = c.id_carta
    WHERE p.fecha = %s
    AND dp.estado = 'pagado'
    GROUP BY c.id_carta, c.nombre, c.porcion, c.unidad_medida
    ORDER BY monto DESC;

    """

    cur.execute(query, (fecha,))
    rows = cur.fetchall()

    resultado = []
    for r in rows:
        resultado.append({
            "id_carta": r[0],
            "nombre": r[1],
            "porcion": r[2],
            "unidad_medida": r[3],
            "cantidad": int(r[4]),
            "monto": float(r[5] or 0)
        })


    cur.close()
    conn.close()
    return resultado


def get_productos_perdida_por_dia(fecha):
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT 
        c.id_carta,
        c.nombre,
        c.porcion,
        c.unidad_medida,
        COUNT(dp.id_detalle) AS cantidad,
        SUM(dp.precio_unitario) AS monto
    FROM detalle_pedido dp
    INNER JOIN pedidos p 
      ON dp.id_pedido = p.id_pedido
    INNER JOIN carta c
      ON dp.id_carta = c.id_carta
    WHERE p.fecha = %s
      AND dp.estado = 'perdida'
    GROUP BY c.id_carta, c.nombre, c.porcion, c.unidad_medida
    ORDER BY monto DESC;
    """

    cur.execute(query, (fecha,))
    rows = cur.fetchall()

    resultado = []
    for r in rows:
        resultado.append({
            "id_carta": r[0],
            "nombre": r[1],
            "porcion": r[2],
            "unidad_medida": r[3],
            "cantidad": int(r[4]),
            "monto": float(r[5] or 0)
        })

    cur.close()
    conn.close()
    return resultado

def get_tipos_venta_por_dia(fecha):
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT 
        m.tipo_mesa,
        COUNT(DISTINCT p.id_pedido) AS cantidad_pedidos,
        COALESCE(SUM(dp.precio_unitario), 0) AS monto_total
    FROM pedidos p
    INNER JOIN mesas m 
      ON p.id_mesa = m.id_mesas
    INNER JOIN detalle_pedido dp
      ON dp.id_pedido = p.id_pedido
    WHERE p.fecha = %s
      AND dp.estado = 'pagado'
    GROUP BY m.tipo_mesa
    ORDER BY monto_total DESC;
    """

    cur.execute(query, (fecha,))
    rows = cur.fetchall()

    resultado = []
    for r in rows:
        resultado.append({
            "tipo_mesa": r[0],
            "cantidad": int(r[1]),
            "monto": float(r[2] or 0)
        })

    cur.close()
    conn.close()
    return resultado


def get_ventas_por_mesa_dia(fecha):
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT 
        m.nombre,
        COUNT(DISTINCT p.id_pedido) AS cantidad_pedidos,
        COALESCE(SUM(dp.precio_unitario), 0) AS monto_total
    FROM pedidos p
    INNER JOIN mesas m 
      ON p.id_mesa = m.id_mesas
    INNER JOIN detalle_pedido dp
      ON dp.id_pedido = p.id_pedido
    WHERE p.fecha = %s
      AND dp.estado = 'pagado'
    GROUP BY m.nombre
    ORDER BY monto_total DESC;
    """

    cur.execute(query, (fecha,))
    rows = cur.fetchall()

    resultado = []
    for r in rows:
        resultado.append({
            "mesa": r[0],
            "pedidos": int(r[1]),
            "monto": float(r[2] or 0)
        })

    cur.close()
    conn.close()
    return resultado

def get_resumen_pedidos_por_dia(fecha):
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT 
        p.id_pedido,
        m.nombre AS mesa,
        p.fecha,
        p.hora_pedido,
        p.hora_pago,
        p.estado,
        p.forma_pago,

        -- 👉 Consumo real del pedido
        COALESCE(d.total_detalle, 0) AS monto_pedido,

        -- 👉 Dinero realmente recibido
        COALESCE(pg.total_pago, 0) AS monto_pagado,

        -- 👉 Vuelto correcto
        COALESCE(pg.total_pago, 0) - COALESCE(d.total_detalle, 0) AS vuelto

    FROM pedidos p
    LEFT JOIN mesas m 
    ON p.id_mesa = m.id_mesas

    -- 🔹 Subconsulta para detalle_pedido (sin duplicaciones)
    LEFT JOIN (
    SELECT 
        id_pedido,
        SUM(precio_unitario) AS total_detalle
    FROM detalle_pedido WHERE estado ='pagado'
    GROUP BY id_pedido
    ) d
    ON p.id_pedido = d.id_pedido

    -- 🔹 Subconsulta para pagos (sin duplicaciones)
    LEFT JOIN (
    SELECT 
        id_pedido,
        SUM(monto_total) AS total_pago
    FROM pagos
    GROUP BY id_pedido
    ) pg
    ON p.id_pedido = pg.id_pedido

    WHERE p.fecha = %s

    ORDER BY p.hora_pedido DESC;



    """

    cur.execute(query, (fecha,))
    rows = cur.fetchall()

    resultado = []
    for r in rows:
        resultado.append({
            "id_pedido": r[0],
            "mesa": r[1] or "SIN MESA",
            "fecha": str(r[2]),
            "hora_pedido": str(r[3]),
            "hora_pago": str(r[4]) if r[4] else "-",
            "estado": r[5],
            "forma_pago": r[6] or "-",
            "monto_pedido": float(r[7] or 0),
            "monto_pagado": float(r[8] or 0),
            "vuelto": float(r[9] or 0)
        })


    cur.close()
    conn.close()
    return resultado


def get_caja_dia(fecha):
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT 
        COALESCE(SUM(pg.monto_total) FILTER (WHERE pg.metodo_pago = 'efectivo'), 0.00) AS efectivo,
        COALESCE(SUM(pg.monto_total) FILTER (WHERE pg.metodo_pago = 'yape'), 0.00) AS yape,
        COALESCE(SUM(pg.monto_total) FILTER (WHERE pg.metodo_pago = 'plin'), 0.00) AS plin,
        COALESCE(SUM(pg.monto_total) FILTER (WHERE pg.metodo_pago = 'agora'), 0.00) AS agora,
        COALESCE(SUM(pg.monto_total) FILTER (WHERE pg.metodo_pago = 'transferencia'), 0.00) AS transferencia,

        COALESCE((
            SELECT SUM(dp.precio_unitario)
            FROM detalle_pedido dp
            INNER JOIN pedidos pd2 ON dp.id_pedido = pd2.id_pedido
            WHERE pd2.fecha = %s 
              AND dp.estado = 'pagado'
        ), 0.00) AS total_ingresos,

        COALESCE((
            SELECT SUM(dp.precio_unitario)
            FROM detalle_pedido dp
            INNER JOIN pedidos pd3 ON dp.id_pedido = pd3.id_pedido
            WHERE pd3.fecha = %s 
              AND dp.estado = 'perdida'
        ), 0.00) AS perdidas

    FROM pagos pg
    INNER JOIN pedidos pd ON pg.id_pedido = pd.id_pedido
    WHERE pd.fecha = %s;
    """

    cur.execute(query, (fecha, fecha, fecha))
    r = cur.fetchone()

    resultado = {
        "efectivo": float(r[0] or 0),
        "yape": float(r[1] or 0),
        "plin": float(r[2] or 0),
        "agora": float(r[3] or 0),
        "transferencia": float(r[4] or 0),
        "total_ingresos": float(r[5] or 0),
        "perdidas": float(r[6] or 0)
    }

    cur.close()
    conn.close()
    return resultado
