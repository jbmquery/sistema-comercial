# controllers/pedidos_controller.py

from conexion_postgresql import get_connection
from datetime import datetime

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
            """, (
                id_pedido,
                det["id_carta"],
                1,  # 👈 SIEMPRE 1, tal como pediste
                det.get("precio_unitario"),
                det.get("observacion", ""),
                det.get("es_canjeable", False),
                det.get("estado", "pendiente")
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
