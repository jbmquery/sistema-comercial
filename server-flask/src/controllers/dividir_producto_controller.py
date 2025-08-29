# controllers/dividir_producto_controller.py
from conexion_postgresql import get_connection

def dividir_detalle_pedido(id_detalle):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener el detalle actual
        cursor.execute("""
            SELECT id_pedido, id_carta, cantidad, precio_unitario, observacion, estado
            FROM detalle_pedido
            WHERE id_detalle = %s
        """, (id_detalle,))
        row = cursor.fetchone()
        if not row:
            return {"message": "Detalle no encontrado"}

        id_pedido, id_carta, cantidad, precio_unitario, observacion, estado = row

        if cantidad <= 1:
            return {"message": "No se puede dividir un producto con cantidad 1"}

        # Iniciar transacción
        # Actualizar el registro original: cantidad - 1
        cursor.execute("""
            UPDATE detalle_pedido
            SET cantidad = cantidad - 1
            WHERE id_detalle = %s
        """, (id_detalle,))

        # Insertar nuevo registro con cantidad = 1
        cursor.execute("""
            INSERT INTO detalle_pedido (id_pedido, id_carta, cantidad, precio_unitario, observacion, estado)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id_detalle
        """, (id_pedido, id_carta, 1, precio_unitario, observacion, estado))

        nuevo_id = cursor.fetchone()[0]

        conn.commit()
        return {
            "success": True,
            "message": "Producto dividido correctamente",
            "ids": [id_detalle, nuevo_id]
        }

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al dividir producto: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()