from flask import request, jsonify
from datetime import datetime
from conexion_postgresql import get_connection


def pagar_cuenta(id_pedido):
    data = request.json

    cuenta = data['cuenta']
    detalles_ids = data['detalles']      # ids de detalle_pedido seleccionados
    pagos = data['pagos']                # pagos compuestos [{metodo, monto}]
    vuelto = float(data.get('vuelto', 0))

    conn = get_connection()
    cur = conn.cursor()

    try:
        # 1️⃣ Calcular total real desde BD
        cur.execute("""
            SELECT COALESCE(SUM(precio_unitario), 0)
            FROM detalle_pedido
            WHERE id_detalle = ANY(%s)
              AND estado = 'pendiente'
              AND id_pedido = %s
        """, (detalles_ids, id_pedido))

        total_db = float(cur.fetchone()[0])
        total_pagado = sum(float(p['monto']) for p in pagos)

        if total_pagado < total_db:
            return jsonify({"error": "Pago incompleto"}), 400

        # 2️⃣ Registrar pagos (uno por método)
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

        # 3️⃣ Marcar productos como pagados
        cur.execute("""
            UPDATE detalle_pedido
            SET estado = 'pagado',
                cuenta = %s
            WHERE id_detalle = ANY(%s)
        """, (cuenta, detalles_ids))

        # 4️⃣ Evaluar estado final del pedido
        cur.execute("""
            SELECT estado
            FROM detalle_pedido
            WHERE id_pedido = %s
        """, (id_pedido,))

        estados = [r[0] for r in cur.fetchall()]

        if all(e == 'pagado' for e in estados):
            estado_pedido = 'completado'
        elif any(e in ('cancelado', 'perdida') for e in estados):
            estado_pedido = 'inconcluso'
        else:
            estado_pedido = 'abierto'

        # 5️⃣ Actualizar pedido
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
            datetime.now(),
            forma_pago,
            total_pagado,
            vuelto,
            id_pedido
        ))

        conn.commit()

        return jsonify({
            "ok": True,
            "estado_pedido": estado_pedido,
            "cuenta_pagada": cuenta
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
