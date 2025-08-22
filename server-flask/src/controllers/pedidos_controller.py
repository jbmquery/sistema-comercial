from conexion_postgresql import get_connection
import psycopg2

def obtener_pedidos_activos():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT 
            p.id_pedido,
            p.id_mesa,
            m.nombre AS nombre_mesa,
            p.estado AS estado_pedido,
            p.hora_pedido,
            dp.id_detalle,
            dp.id_carta,
            c.nombre AS nombre_producto,
            dp.cantidad,
            dp.precio_unitario::numeric,
            dp.observacion,
            dp.estado AS estado_detalle,
            c.porcion,
            c.unidad_medida
        FROM pedidos p
        JOIN mesas m ON p.id_mesa = m.id_mesas
        JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
        JOIN carta c ON dp.id_carta = c.id_carta
        WHERE p.estado IN ('Sin iniciar', 'Proceso')
          AND p.estado != 'Pagado'
        ORDER BY p.id_pedido, dp.id_detalle;
        """

        cursor.execute(query)
        rows = cursor.fetchall()
        columnas = [desc[0] for desc in cursor.description]

        pedidos = {}
        for row in rows:
            item = dict(zip(columnas, row))

            # Convertir precios a float
            if isinstance(item['precio_unitario'], str):
                item['precio_unitario'] = float(item['precio_unitario'].replace('€', '').replace(',', '.'))

            # Agrupar por id_pedido
            id_pedido = item['id_pedido']
            if id_pedido not in pedidos:
                pedidos[id_pedido] = {
                    "id_pedido": id_pedido,
                    "id_mesa": item['id_mesa'],
                    "nombre_mesa": item['nombre_mesa'],
                    "estado_pedido": item['estado_pedido'],
                    "hora_pedido": str(item['hora_pedido']) if item['hora_pedido'] else None,
                    "productos": []
                }
            pedidos[id_pedido]["productos"].append({
                "id_detalle": item['id_detalle'],
                "id_carta": item['id_carta'],
                "nombre_producto": (
                    f"{item['nombre_producto']} ({item['porcion']} {item['unidad_medida']})"
                    if item['porcion'] and item['unidad_medida']
                    else item['nombre_producto']
                ),
                "cantidad": item['cantidad'],
                "precio_unitario": item['precio_unitario'],
                "observacion": item['observacion'],
                "estado_detalle": item['estado_detalle'],
            })

        return list(pedidos.values())

    except Exception as e:
        print(f"Error obteniendo pedidos activos: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()