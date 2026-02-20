from flask import request, jsonify
from datetime import datetime
from conexion_postgresql import get_connection


def pagar_cuenta(id_pedido):
    data = request.json

    detalles_ids = data.get('detalles', [])
    pagos = data.get('pagos', [])
    vuelto = float(data.get('vuelto', 0))

    if not detalles_ids or not pagos:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
        # 🔒 Iniciar transacción
        cur.execute("BEGIN")

        # 1️⃣ Calcular CUENTA UNA SOLA VEZ (desde pagos)
        cur.execute("""
            SELECT COALESCE(MAX(cuenta), 0) + 1
            FROM pagos
            WHERE id_pedido = %s
        """, (id_pedido,))
        cuenta = cur.fetchone()[0]

        # 2️⃣ Validar que los detalles sigan pendientes
        cur.execute("""
            SELECT COUNT(*)
            FROM detalle_pedido
            WHERE id_detalle = ANY(%s)
              AND id_pedido = %s
              AND estado = 'pendiente'
        """, (detalles_ids, id_pedido))

        if cur.fetchone()[0] != len(detalles_ids):
            raise Exception("Uno o más productos ya fueron pagados")

        # 3️⃣ Calcular total real desde BD
        cur.execute("""
            SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
            FROM detalle_pedido
            WHERE id_detalle = ANY(%s)
              AND estado = 'pendiente'
              AND id_pedido = %s
        """, (detalles_ids, id_pedido))

        total_db = float(cur.fetchone()[0])
        total_pagado = sum(float(p['monto']) for p in pagos)

        if total_pagado < total_db:
            raise Exception("El monto ingresado no cubre el total")

        # 4️⃣ Registrar pagos (MISMA cuenta)
        for pago in pagos:
            cur.execute("""
                INSERT INTO pagos (
                    id_pedido,
                    cuenta,
                    monto_total,
                    metodo_pago
                ) VALUES (%s, %s, %s, %s)
            """, (
                id_pedido,
                cuenta,
                pago['monto'],
                pago['metodo']
            ))

        # 5️⃣ Marcar productos como pagados (padres + hijos)
        cur.execute("""
            UPDATE detalle_pedido
            SET estado = 'pagado',
                cuenta = %s
            WHERE id_pedido = %s
            AND (
                    id_detalle = ANY(%s)
                    OR id_detalle_padre = ANY(%s)
                )
        """, (
            cuenta,
            id_pedido,
            detalles_ids,  # padres
            detalles_ids   # hijos de esos padres
        ))


        # 6️⃣ Determinar estado final del pedido
        cur.execute("""
            SELECT estado
            FROM detalle_pedido
            WHERE id_pedido = %s
        """, (id_pedido,))

        estados = [e[0] for e in cur.fetchall()]

        if all(e == 'pagado' for e in estados):
            estado_pedido = 'completado'
        elif any(e in ('cancelado', 'perdida') for e in estados):
            estado_pedido = 'inconcluso'
        else:
            estado_pedido = 'abierto'

        # 7️⃣ Actualizar pedido
        forma_pago = 'mixto' if len(pagos) > 1 else 'unico'

        cur.execute("""
            UPDATE pedidos
            SET
                estado = %s,
                hora_pago = %s,
                forma_pago = %s,
                monto_pagado = %s,
                monto_vuelto = %s
            WHERE id_pedido = %s
        """, (
            estado_pedido,
            datetime.now().time(),
            forma_pago,
            total_pagado,
            vuelto,
            id_pedido
        ))

        # 8️⃣ Liberar mesa si corresponde
        if estado_pedido in ('completado', 'inconcluso'):
            cur.execute("""
                UPDATE mesas
                SET disponibilidad = true
                WHERE id_mesas = (
                    SELECT id_mesa
                    FROM pedidos
                    WHERE id_pedido = %s
                )
            """, (id_pedido,))

        conn.commit()

        return jsonify({
            "ok": True,
            "mensaje": "Pago registrado correctamente",
            "cuenta": cuenta,
            "estado_pedido": estado_pedido,
            "total_pagado": total_pagado,
            "vuelto": vuelto
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 400

    finally:
        cur.close()
        conn.close()
