# controllers/canje_controller.py
from conexion_postgresql import get_connection

def obtener_detalle_con_puntos(id_pedido):
    """
    Obtiene el detalle del pedido con el campo puntos_canje de la tabla carta
    """
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
            c.nombre,
            c.puntos_canje,
            dp.estado,
            dp.id_carta,
            c.porcion,
            c.unidad_medida
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
                "nombre_producto": row[3],
                "puntos_canje": row[4],
                "estado": row[5],
                "id_carta": row[6],
                "porcion": row[7],
                "unidad_medida": row[8]
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error obteniendo detalle con puntos: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def validar_canje_producto(id_cliente, id_detalle):
    """
    Valida si el cliente puede canjear el producto (suficientes puntos, no repetido, etc.)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener puntos del cliente
        cursor.execute("SELECT puntos_acumulados FROM clientes WHERE id_cliente = %s", (id_cliente,))
        cliente_row = cursor.fetchone()
        if not cliente_row:
            return {"success": False, "message": "Cliente no encontrado"}

        puntos_cliente = cliente_row[0]

        # Obtener puntos_canje del producto
        cursor.execute("""
            SELECT c.puntos_canje, dp.id_detalle, dp.cantidad
            FROM detalle_pedido dp
            JOIN carta c ON dp.id_carta = c.id_carta
            WHERE dp.id_detalle = %s
        """, (id_detalle,))
        producto_row = cursor.fetchone()
        if not producto_row:
            return {"success": False, "message": "Producto no encontrado"}

        puntos_requeridos = producto_row[0]

        if puntos_cliente < puntos_requeridos:
            return {
                "success": False,
 
                "message": f"Puntos insuficientes. Necesita {puntos_requeridos}, tiene {puntos_cliente}"
            }

        return {
            "success": True,
            "puntos_requeridos": puntos_requeridos,
            "nombre_producto": producto_row[1]
        }
    except Exception as e:
        print(f"Error validando canje: {e}")
        return {"success": False, "message": "Error interno"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

""""AQUI VA LA FUNCION REGISTRAR CANJE MULTIPLE"""

def registrar_canje_multiple(datos):
    print("🔍 Tipo de 'str':", type(str))
    """
    Registra el pago, actualiza estados, puntos, y genera historial
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print("✅ [DEBUG] Iniciando registro de pago con datos:", datos)

        id_pedido = datos.get('id_pedido')
        forma_pago = datos.get('forma_pago')
        monto_pagado = datos.get('monto_pagado')
        monto_vuelto = datos.get('monto_vuelto')
        puntos_canjeados_total = datos.get('puntos_canjeados_total', 0)
        cliente_acumula_id = datos.get('cliente_acumula_id')
        descuentos = datos.get('descuentos', [])

        print(f"🔍 Validando pedido ID: {id_pedido}")
        cursor.execute("SELECT id_mesa, estado FROM pedidos WHERE id_pedido = %s", (id_pedido,))
        pedido_row = cursor.fetchone()
        if not pedido_row:
            print("❌ Pedido no encontrado")
            return {"success": False, "message": "Pedido no encontrado"}
        if pedido_row[1] != 'Entregado':
            print("❌ Estado del pedido no es 'Entregado'")
            return {"success": False, "message": "Pedido no válido"}
        
        id_mesa = pedido_row[0]
        print(f"✅ Pedido válido. Mesa: {id_mesa}")

        # --- 1. Actualizar detalle_pedido: marcar canjeados ---
        for i, desc in enumerate(descuentos):
            print(f"🔄 Actualizando detalle {desc['id_detalle']} para cliente {desc['id_cliente']}")
            cursor.execute("""
                UPDATE detalle_pedido 
                SET estado = 'Canjeado', canjeado_por = %s 
                WHERE id_detalle = %s
            """, (desc['id_cliente'], desc['id_detalle']))
            if cursor.rowcount == 0:
                print(f"❌ No se encontró id_detalle={desc['id_detalle']}")
                raise Exception("Detalle no encontrado")

        # --- 2. Actualizar puntos de clientes que canjearon ---
        for i, desc in enumerate(descuentos):
            print(f"🔄 Restando puntos al cliente {desc['id_cliente']} por id_detalle={desc['id_detalle']}")
            cursor.execute("""
                UPDATE clientes 
                SET puntos_acumulados = puntos_acumulados - (
                    SELECT c.puntos_canje FROM carta c 
                    JOIN detalle_pedido dp ON c.id_carta = dp.id_carta 
                    WHERE dp.id_detalle = %s
                )
                WHERE id_cliente = %s
            """, (desc['id_detalle'], desc['id_cliente']))
            if cursor.rowcount == 0:
                print(f"❌ Cliente {desc['id_cliente']} no encontrado")
                raise Exception("Cliente no encontrado")

            # Registrar en historial_puntos
            cursor.execute("""
                INSERT INTO historial_puntos (id_historial, id_cliente, id_pedido, tipo, puntos, fecha, descripcion)
                VALUES (nextval('historial_puntos_id_historial_seq'), %s, %s, 'Canje', 
                        -(SELECT c.puntos_canje FROM carta c JOIN detalle_pedido dp ON c.id_carta = dp.id_carta WHERE dp.id_detalle = %s),
                        CURRENT_DATE, 'Canje por producto')
            """, (desc['id_cliente'], id_pedido, desc['id_detalle']))

        # --- 3. Acumular puntos para el cliente principal (si aplica) ---
        if cliente_acumula_id:
            print(f"🔄 Acumulando puntos para cliente {cliente_acumula_id}")
            cursor.execute("""
                SELECT SUM(precio_unitario * cantidad) 
                FROM detalle_pedido 
                WHERE id_pedido = %s AND estado != 'Canjeado'
            """,(id_pedido,)),
            monto_pagado_db = cursor.fetchone()[0] or 0
            puntos_ganados = int(monto_pagado_db)
            print(f"💰 Puntos a ganar: {puntos_ganados}")

            cursor.execute("""
                UPDATE clientes 
                SET puntos_acumulados = puntos_acumulados + %s 
                WHERE id_cliente = %s
            """, (puntos_ganados, cliente_acumula_id))
            if cursor.rowcount == 0:
                print(f"❌ Cliente acumula {cliente_acumula_id} no encontrado")
                raise Exception("Cliente acumula no encontrado")

            cursor.execute("""
                INSERT INTO historial_puntos (id_historial, id_cliente, id_pedido, tipo, puntos, fecha, descripcion)
                VALUES (nextval('historial_puntos_id_historial_seq'), %s, %s, 'Acumulación', %s, CURRENT_DATE, 'Acumulación por compra')
            """, (cliente_acumula_id, id_pedido, puntos_ganados))

        # --- 4. Actualizar pedido ---
        print(f"🔄 Actualizando pedido {id_pedido} a 'Pagado'")
        cursor.execute("""
            UPDATE pedidos 
            SET estado = 'Pagado', 
                hora_pago = CURRENT_TIME,
                forma_pago = %s,
                puntos_canjeados_total = %s,
                monto_pagado = %s,
                monto_vuelto = %s,
                id_cliente = %s
            WHERE id_pedido = %s
        """, (forma_pago, puntos_canjeados_total, monto_pagado, monto_vuelto, cliente_acumula_id, id_pedido))

        # --- 5. Liberar mesa ---
        print(f"🔓 Liberando mesa {id_mesa}")
        cursor.execute("UPDATE mesas SET disponibilidad = true WHERE id_mesas = %s", (id_mesa,))

        conn.commit()
        print("🎉 ¡Pago registrado con éxito!")
        return {"success": True, "message": "Pago registrado correctamente"}
    
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"💥 ERROR CRÍTICO: {e}")
        return {"success": False, "message": f"Error interno: {str(e)}"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()