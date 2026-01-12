from flask import jsonify
from conexion_postgresql import get_connection


def obtener_cuenta_actual(id_pedido):
    """
    Devuelve la siguiente cuenta disponible para un pedido.
    Ejemplo:
    si existen cuentas 1,2,3 → devuelve 4
    """

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT COALESCE(MAX(cuenta), 0) + 1 AS cuenta_actual
            FROM detalle_pedido
            WHERE id_pedido = %s;
        """, (id_pedido,))

        row = cursor.fetchone()
        cuenta_actual = row[0] if row else 1

        return jsonify({
            "id_pedido": id_pedido,
            "cuenta_actual": cuenta_actual
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Error al obtener la cuenta actual",
            "detalle": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()
