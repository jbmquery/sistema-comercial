# controllers/detalle_pedido_controller.py
from conexion_postgresql import get_connection

def agregar_detalle(datos):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener precio_unitario desde carta
        cursor.execute("SELECT precio FROM carta WHERE id_carta = %s", (datos['id_carta'],))
        precio_row = cursor.fetchone()
        if not precio_row:
            return {"message": "Producto no encontrado"}

        precio_unitario = float(precio_row[0])

        # Insertar en detalle_pedido
        query = """
        INSERT INTO detalle_pedido (
            id_pedido, id_carta, cantidad, precio_unitario, observacion, estado
        ) VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id_detalle
        """
        cursor.execute(query, (
            datos['id_pedido'],
            datos['id_carta'],
            datos['cantidad'],
            precio_unitario,
            datos.get('observacion', ''),
            datos['estado']
        ))
        id_detalle = cursor.fetchone()[0]

        conn.commit()
        return {"id_detalle": id_detalle, "message": "Producto agregado"}

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al agregar producto: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()