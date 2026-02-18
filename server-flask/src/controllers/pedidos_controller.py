# controllers/pedidos_controller.py

from conexion_postgresql import get_connection
from datetime import datetime
from services.pedidos_service import recalcular_estado_pedido


def crear_pedido(data):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # =========================
        # 1️⃣ INSERTAR PEDIDO
        # =========================
        cursor.execute("""
            INSERT INTO pedidos (
                id_mesa,
                id_cliente,
                id_usuario,
                fecha,
                hora_pedido,
                estado,
                cantidad_clientes,
                observacion,
                forma_pago,
                puntos_canjeados_total,
                monto_pagado,
                monto_vuelto
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id_pedido
        """, (
            data.get("id_mesa"),
            data.get("id_cliente"),
            data.get("id_usuario"),
            datetime.now().date(),
            datetime.now().time(),
            data.get("estado", "abierto"),
            data.get("cantidad_clientes", 1),
            data.get("observacion", ""),
            data.get("forma_pago", ""),
            data.get("puntos_canjeados_total", 0),
            data.get("monto_pagado", 0),
            data.get("monto_vuelto", 0)
        ))

        id_pedido = cursor.fetchone()[0]

        # =========================
        # 2️⃣ INSERTAR DETALLES
        # =========================
        detalles = data.get("detalles", [])

        temp_map = {}  # tempId → id_detalle real

        # PRIMERA PASADA: INSERTAR TODO
        for det in detalles:
            cursor.execute("""
                INSERT INTO detalle_pedido (
                    id_pedido,
                    id_carta,
                    cantidad,
                    precio_unitario,
                    observacion,
                    es_canjeable,
                    estado
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                RETURNING id_detalle
            """, (
                id_pedido,
                det["id_carta"],
                1,
                det.get("precio_unitario"),
                det.get("observacion", ""),
                det.get("es_canjeable", False),
                det.get("estado", "pendiente")
            ))

            id_detalle_real = cursor.fetchone()[0]
            temp_map[det["tempId"]] = id_detalle_real


        # SEGUNDA PASADA: ACTUALIZAR PADRES (TOPPINGS)
        for det in detalles:
            parent_temp = det.get("parentTempId")

            if parent_temp:
                cursor.execute("""
                    UPDATE detalle_pedido
                    SET id_detalle_padre = %s
                    WHERE id_detalle = %s
                """, (
                    temp_map[parent_temp],       # padre real
                    temp_map[det["tempId"]]      # hijo real
                ))


        # =========================
        # 3️⃣ OCUPAR MESA
        # =========================
        if data.get("id_mesa"):
            cursor.execute("""
                UPDATE mesas
                SET disponibilidad = false
                WHERE id_mesas = %s
            """, (data["id_mesa"],))

        # =========================
        # 4️⃣ COMMIT
        # =========================
        conn.commit()

        return {
            "success": True,
            "id_pedido": id_pedido
        }

    except Exception as e:
        if conn:
            conn.rollback()
        print("❌ Error crear_pedido:", e)
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def agregar_detalle_pedido(id_pedido, data):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Validaciones básicas
        if not data.get("id_carta"):
            return {"success": False, "error": "Producto no válido"}

        cursor.execute("""
            INSERT INTO detalle_pedido (
                id_pedido,
                id_carta,
                cantidad,
                precio_unitario,
                observacion,
                es_canjeable,
                estado,
                canjeado_por,
                cuenta
            )
            SELECT
                %s,
                c.id_carta,
                1,
                c.precio,
                %s,
                false,
                'pendiente',
                NULL,
                NULL
            FROM carta c
            WHERE c.id_carta = %s
            RETURNING id_detalle
        """, (
            id_pedido,
            data.get("observacion", ""),
            data["id_carta"]
        ))

        id_detalle = cursor.fetchone()[0]
        conn.commit()

        return {
            "success": True,
            "id_detalle": id_detalle
        }

    except Exception as e:
        if conn:
            conn.rollback()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def actualizar_estado_detalle(id_detalle, nuevo_estado):
    if nuevo_estado not in ('cancelado', 'perdida'):
        return {"success": False, "error": "Estado no válido"}

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Validar que el detalle exista y esté pendiente
        cursor.execute("""
            SELECT estado
            FROM detalle_pedido
            WHERE id_detalle = %s
        """, (id_detalle,))

        row = cursor.fetchone()

        if not row:
            return {"success": False, "error": "Detalle no encontrado"}

        if row[0] != 'pendiente':
            return {"success": False, "error": "El producto ya no está pendiente"}

        # Actualizar padre + hijos
        cursor.execute("""
            UPDATE detalle_pedido
            SET estado = %s
            WHERE id_detalle = %s
            OR id_detalle_padre = %s
            RETURNING id_pedido
        """, (nuevo_estado, id_detalle, id_detalle))

        row = cursor.fetchone()
        id_pedido = row[0]


        recalcular_estado_pedido(conn, id_pedido)
        conn.commit()

        return {
            "success": True,
            "mensaje": f"Producto marcado como {nuevo_estado}"
        }

    except Exception as e:
        if conn:
            conn.rollback()
        return {"success": False, "error": str(e)}

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def cambiar_mesa_pedido(id_pedido, id_mesa_nueva):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1️⃣ Obtener mesa actual del pedido
        cursor.execute("""
            SELECT id_mesa
            FROM pedidos
            WHERE id_pedido = %s
        """, (id_pedido,))
        row = cursor.fetchone()

        if not row:
            return {"error": "PEDIDO_NO_EXISTE"}

        id_mesa_actual = row[0]

        # 2️⃣ Validar que la nueva mesa esté disponible
        cursor.execute("""
            SELECT disponibilidad
            FROM mesas
            WHERE id_mesas = %s
        """, (id_mesa_nueva,))
        mesa = cursor.fetchone()

        if not mesa or mesa[0] is False:
            return {"error": "MESA_NO_DISPONIBLE"}

        # 3️⃣ Actualizar pedido
        cursor.execute("""
            UPDATE pedidos
            SET id_mesa = %s
            WHERE id_pedido = %s
        """, (id_mesa_nueva, id_pedido))

        # 4️⃣ Liberar mesa anterior
        cursor.execute("""
            UPDATE mesas
            SET disponibilidad = true
            WHERE id_mesas = %s
        """, (id_mesa_actual,))

        # 5️⃣ Ocupar nueva mesa
        cursor.execute("""
            UPDATE mesas
            SET disponibilidad = false
            WHERE id_mesas = %s
        """, (id_mesa_nueva,))

        conn.commit()

        return {"success": True}

    except Exception as e:
        conn.rollback()
        return {"error": str(e)}

    finally:
        cursor.close()
        conn.close()
