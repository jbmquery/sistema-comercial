# controllers/pedido_controller.py
from conexion_postgresql import get_connection
import psycopg2

# controllers/pedido_controller.py

def crear_pedido(datos):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 1. Verificar que la mesa exista y esté disponible
        cursor.execute("SELECT disponibilidad FROM mesas WHERE id_mesas = %s", (datos['id_mesa'],))
        mesa = cursor.fetchone()
        if not mesa:
            return {"message": "Mesa no encontrada"}
        if not mesa[0]:
            return {"message": "La mesa ya está ocupada"}

        # 2. Insertar el pedido
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

        # 3. Insertar detalles
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

        # 4. Actualizar disponibilidad de la mesa → FALSE (ocupada)
        cursor.execute(
            "UPDATE mesas SET disponibilidad = %s WHERE id_mesas = %s",
            (False, datos['id_mesa'])
        )

        # 5. Confirmar transacción
        conn.commit()
        return {"id_pedido": id_pedido, "message": "Pedido guardado y mesa ocupada"}

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al guardar pedido: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()