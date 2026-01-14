def recalcular_estado_pedido(conn, id_pedido):
    cur = conn.cursor()

    cur.execute("""
        SELECT estado
        FROM detalle_pedido
        WHERE id_pedido = %s
    """, (id_pedido,))

    estados = [row[0] for row in cur.fetchall()]

    if not estados:
        nuevo_estado = 'cancelado'
    elif any(e == 'pendiente' for e in estados):
        nuevo_estado = 'abierto'
    elif all(e == 'pagado' for e in estados):
        nuevo_estado = 'completado'
    elif all(e in ('cancelado', 'perdida') for e in estados):
        nuevo_estado = 'cancelado'
    else:
        nuevo_estado = 'inconcluso'

    cur.execute("""
        UPDATE pedidos
        SET estado = %s
        WHERE id_pedido = %s
    """, (nuevo_estado, id_pedido))

    if nuevo_estado != 'abierto':
        cur.execute("""
            UPDATE mesas
            SET disponibilidad = true
            WHERE id_mesas = (
                SELECT id_mesa FROM pedidos WHERE id_pedido = %s
            )
        """, (id_pedido,))

    cur.close()
