# controllers/pagos_controller.py
from conexion_postgresql import get_connection

def buscar_clientes_por_dni(dni):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT 
            id_cliente,
            nombres,
            ape_paterno,
            ape_materno,
            dni,
            puntos_acumulados
        FROM clientes 
        WHERE dni ILIKE %s
        ORDER BY id_cliente
        LIMIT 10
        """
        cursor.execute(query, (f'%{dni}%',))
        rows = cursor.fetchall()

        return [
            {
                "id_cliente": row[0],
                "nombre_completo": f"{row[1]} {row[2] or ''} {row[3] or ''}".strip(),
                "dni": row[4],
                "puntos_acumulados": row[5] or 0
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error buscando clientes: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def obtener_pedidos_entregados():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT 
            p.id_pedido,
            p.numero_orden,
            m.nombre AS nombre_mesa,
            p.hora_pedido,
            COALESCE(c.nombres, '') || ' ' || COALESCE(c.ape_paterno, '') AS nombre_cliente
        FROM pedidos p
        JOIN mesas m ON p.id_mesa = m.id_mesas
        LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
        WHERE p.estado = 'Entregado'
        ORDER BY p.id_pedido DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        return [
            {
                "id_pedido": row[0],
                "numero_orden": row[1],
                "nombre_mesa": row[2],
                "hora_pedido": str(row[3]),
                "nombre_cliente": row[4].strip()
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error obteniendo pedidos entregados: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def obtener_detalle_pedido(id_pedido):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT 
            dp.id_detalle,
            dp.cantidad,
            dp.precio_unitario,
            c.nombre
        FROM detalle_pedido dp
        JOIN carta c ON dp.id_carta = c.id_carta
        WHERE dp.id_pedido = %s
        ORDER BY dp.id_detalle
        """
        cursor.execute(query, (id_pedido,))
        rows = cursor.fetchall()

        return [
            {
                "id_detalle": row[0],
                "cantidad": row[1],
                "precio_unitario": float(row[2]),
                "nombre_producto": row[3]
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error obteniendo detalle del pedido: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()