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

# Actualizar estado de detalle de pedido

def actualizar_estado_detalle(id_detalle, nuevo_estado):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener id_pedido
        cursor.execute("SELECT id_pedido FROM detalle_pedido WHERE id_detalle = %s", (id_detalle,))
        row = cursor.fetchone()
        if not row:
            return {"message": "Detalle no encontrado"}
        id_pedido = row[0]

        # Actualizar estado del detalle
        cursor.execute(
            "UPDATE detalle_pedido SET estado = %s WHERE id_detalle = %s",
            (nuevo_estado, id_detalle)
        )

        # Obtener todos los estados del pedido
        cursor.execute("SELECT estado FROM detalle_pedido WHERE id_pedido = %s", (id_pedido,))
        estados = [r[0] for r in cursor.fetchall()]

        # Determinar nuevo estado del pedido
        if all(estado == 'Listo' for estado in estados):
            nuevo_estado_pedido = 'Entregado' 
        elif any(estado == 'Listo' for estado in estados):
            nuevo_estado_pedido = 'Proceso'
        else:
            nuevo_estado_pedido = 'Sin iniciar'

        # Obtener estado actual del pedido
        cursor.execute("SELECT estado, id_mesa FROM pedidos WHERE id_pedido = %s", (id_pedido,))
        row = cursor.fetchone()
        if not row:
            return {"message": "Pedido no encontrado"}
        
        estado_actual = row[0]
        id_mesa = row[1]

        # Actualizar estado del pedido si cambia
        if nuevo_estado_pedido != estado_actual:
            if nuevo_estado_pedido == 'Entregado':
                # Usar CURRENT_TIME para hora_entrega
                cursor.execute(
                    """
                    UPDATE pedidos 
                    SET estado = %s, hora_entrega = CURRENT_TIME 
                    WHERE id_pedido = %s
                    """,
                    (nuevo_estado_pedido, id_pedido)
                )
                # Liberar la mesa
                cursor.execute("UPDATE mesas SET disponibilidad = false WHERE id_mesas = %s", (id_mesa,))
            else:
                # Solo actualizar estado
                cursor.execute(
                    "UPDATE pedidos SET estado = %s WHERE id_pedido = %s",
                    (nuevo_estado_pedido, id_pedido)
                )

        conn.commit()
        return {"success": True, "message": "Estado actualizado"}

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al actualizar estado: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def actualizar_observacion_detalle(id_detalle, observacion):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE detalle_pedido SET observacion = %s WHERE id_detalle = %s",
            (observacion, id_detalle)
        )

        conn.commit()
        return {"success": True, "message": "Observación actualizada"}

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al actualizar observación: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Eliminar detalle de pedido

def eliminar_detalle_pedido(id_detalle):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener id_pedido y estado
        cursor.execute("SELECT id_pedido, estado FROM detalle_pedido WHERE id_detalle = %s", (id_detalle,))
        row = cursor.fetchone()
        if not row:
            return {"message": "Detalle no encontrado"}
        
        id_pedido = row[0]
        estado_detalle = row[1]

        if estado_detalle == 'Listo':
            return {"message": "No se puede eliminar un producto ya listo"}

        # Eliminar el detalle
        cursor.execute("DELETE FROM detalle_pedido WHERE id_detalle = %s", (id_detalle,))

        # Verificar si quedan productos
        cursor.execute("SELECT estado FROM detalle_pedido WHERE id_pedido = %s", (id_pedido,))
        estados_restantes = [r[0] for r in cursor.fetchall()]

        # Determinar nuevo estado del pedido
        if not estados_restantes:
            # No quedan productos
            nuevo_estado_pedido = 'Cancelado'
            hora_entrega_sql = ""
        elif all(estado == 'Listo' for estado in estados_restantes):
            nuevo_estado_pedido = 'Entregado'
            hora_entrega_sql = ", hora_entrega = CURRENT_TIME"
        else:
            nuevo_estado_pedido = 'Proceso'  # o mantener lógica
            hora_entrega_sql = ""

        # Actualizar estado del pedido si cambia
        if nuevo_estado_pedido in ['Entregado', 'Cancelado']:
            if nuevo_estado_pedido == 'Cancelado':
                # Liberar mesa
                cursor.execute("UPDATE pedidos SET estado = %s WHERE id_pedido = %s", (nuevo_estado_pedido, id_pedido))
                cursor.execute("UPDATE mesas SET disponibilidad = true WHERE id_mesas = (SELECT id_mesa FROM pedidos WHERE id_pedido = %s)", (id_pedido,))
            else:
                # Pedido entregado
                cursor.execute(f"UPDATE pedidos SET estado = %s {hora_entrega_sql} WHERE id_pedido = %s", (nuevo_estado_pedido, id_pedido))
        else:
            # Solo actualizar estado si es necesario
            if nuevo_estado_pedido != 'Sin iniciar':  # Ajusta según tu lógica
                cursor.execute("UPDATE pedidos SET estado = %s WHERE id_pedido = %s", (nuevo_estado_pedido, id_pedido))

        conn.commit()
        return {"success": True, "message": "Producto eliminado"}

    except Exception as e:
        if conn:
            conn.rollback()
        return {"message": f"Error al eliminar producto: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()