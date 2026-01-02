# controllers/ventas_dia_controller.py
from conexion_postgresql import get_connection

def obtener_ventas_del_dia():
    """
    Obtiene todos los pedidos pagados del día actual, con sus detalles.
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Consulta principal para obtener los pedidos del día
        query_pedidos = """
        SELECT 
            p.id_pedido,
            p.numero_orden,
            m.nombre AS nombre_mesa,
            p.forma_pago,
            p.monto_pagado
        FROM pedidos p
        JOIN mesas m ON p.id_mesa = m.id_mesas
        WHERE p.fecha = CURRENT_DATE 
          AND p.estado = 'Pagado'
        ORDER BY p.id_pedido DESC
        """
        cursor.execute(query_pedidos)
        pedidos_rows = cursor.fetchall()
        
        # Preparar la estructura de respuesta
        pedidos = []
        for row in pedidos_rows:
            id_pedido = row[0]
            
            # Obtener detalles del pedido
            query_detalle = """
            SELECT 
                dp.id_detalle,
                c.nombre,
                dp.cantidad,
                dp.precio_unitario,
                dp.estado
            FROM detalle_pedido dp
            JOIN carta c ON dp.id_carta = c.id_carta
            WHERE dp.id_pedido = %s
            ORDER BY dp.id_detalle
            """
            cursor.execute(query_detalle, (id_pedido,))
            detalle_rows = cursor.fetchall()
            
            # Procesar los detalles
            detalle = []
            for d_row in detalle_rows:
                detalle.append({
                    "id_detalle": d_row[0],
                    "nombre": d_row[1],
                    "cantidad": d_row[2],
                    "precio_total": float(d_row[3]) * d_row[2],
                    "canjeado": d_row[4] == 'Canjeado'
                })
            
            # ✅ CORRECCIÓN: Calcular total del pedido (solo productos NO canjeados)
            total = sum(item["precio_total"] for item in detalle if not item["canjeado"])
            
            pedidos.append({
                "id_pedido": row[0],
                "numero_orden": row[1],
                "nombre_mesa": row[2],
                "forma_pago": row[3],
                "total": float(total),
                "detalle": detalle
            })
        
        # ✅ CONSULTA CORREGIDA: Resumen de pagos (excluye productos canjeados)
        query_resumen = """
        WITH metodos_pago AS (
            SELECT 'efectivo' AS forma_pago
            UNION ALL
            SELECT 'yape'
            UNION ALL
            SELECT 'plin'
            UNION ALL
            SELECT 'transferencia'
        )
        SELECT 
            mp.forma_pago,
            COALESCE(SUM(ventas.precio_unitario * ventas.cantidad), 0) AS total
        FROM metodos_pago mp
        LEFT JOIN (
            SELECT 
                dp.precio_unitario,
                dp.cantidad,
                p.forma_pago
            FROM detalle_pedido dp
            INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE 
                dp.estado != 'Canjeado' 
                AND p.estado = 'Pagado'
                AND p.fecha = CURRENT_DATE
        ) ventas ON mp.forma_pago = ventas.forma_pago
        GROUP BY mp.forma_pago
        ORDER BY mp.forma_pago
        """
        cursor.execute(query_resumen)
        resumen_rows = cursor.fetchall()
        
        # Preparar resumen de pagos
        resumen_pagos = {
            "efectivo": 0.0,
            "yape": 0.0,
            "plin": 0.0,
            "transferencia": 0.0
        }
        
        for row in resumen_rows:
            metodo = row[0].lower()
            resumen_pagos[metodo] = float(row[1])
        
        return {
            "pedidos": pedidos,
            "resumen_pagos": resumen_pagos
        }
    
    except Exception as e:
        print(f"Error obteniendo ventas del día: {e}")
        return {
            "pedidos": [],
            "resumen_pagos": {
                "efectivo": 0.0,
                "yape": 0.0,
                "plin": 0.0,
                "transferencia": 0.0
            }
        }
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()