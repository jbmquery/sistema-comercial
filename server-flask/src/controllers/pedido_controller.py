# controllers/pedido_controller.py
from conexion_postgresql import get_connection
import psycopg2

def crear_pedido(datos):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Insertar en pedidos
        query_pedido = """
        INSERT INTO pedidos (
            id_mesa, id_cliente, id_usuario, fecha, hora_pedido,
            estado, cantidad_clientes, observacion, forma_pago,
            puntos_canjeados_total, monto_pagado, monto_vuelto
        ) VALUES (
            %s, %s, %s, CURRENT_DATE, CURRENT_TIME,
            %s, %s, %s, %s, %s, %s, %s
        ) RETURNING id_pedido
        """
        cursor.execute(query_pedido, (
            datos['id_mesa'],
            datos.get('id_cliente'),
            datos['id_usuario'],
            datos['estado'],
            datos['cantidad_clientes'],
            datos['observacion'],
            datos['forma_pago'],
            datos['puntos_canjeados_total'],
            datos['monto_pagado'],
            datos['monto_vuelto']
        ))
        id_pedido = cursor.fetchone()[0]

        # Insertar en detalle_pedido
        for detalle in datos['detalles']:
            query_detalle = """
            INSERT INTO detalle_pedido (
                id_pedido, id_carta, cantidad, precio_unitario, observacion, es_canjeable
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query_detalle, (
                id_pedido,
                detalle['id_carta'],
                detalle['cantidad'],
                detalle['precio_unitario'],
                detalle.get('observacion', ''),
                detalle['es_canjeable']
            ))

        conn.commit()
        return {"id_pedido": id_pedido, "message": "Pedido guardado"}

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al guardar pedido: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()