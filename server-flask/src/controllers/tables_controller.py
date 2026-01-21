# server-flask/src/controllers/tables_controller.py
from conexion_postgresql import get_connection

def obtener_mesas():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_mesas, nombre, capacidad, disponibilidad, tipo_mesa
            FROM mesas
            ORDER BY id_mesas
        """)
        rows = cursor.fetchall()

        return [
            {
                "id_mesas": row[0],
                "nombre": row[1],
                "capacidad": row[2],
                "disponibilidad": row[3],
                "tipo_mesa": row[4]
            }
            for row in rows
        ]
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def crear_mesa(mesa):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO mesas (nombre, capacidad, disponibilidad, tipo_mesa)
            VALUES (%s, %s, %s, %s)
            RETURNING id_mesas
        """, (
            mesa['nombre'],
            mesa['capacidad'],
            mesa['disponibilidad'],
            mesa['tipo_mesa']
        ))

        id_mesa = cursor.fetchone()[0]
        conn.commit()
        return id_mesa
    except Exception as e:
        if conn: conn.rollback()
        print("Error crear_mesa:", e)
        return None
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def actualizar_mesa(id_mesa, mesa):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 1️⃣ Obtener disponibilidad actual de la mesa
        cursor.execute(
            "SELECT disponibilidad FROM mesas WHERE id_mesas = %s",
            (id_mesa,)
        )
        row = cursor.fetchone()

        if not row:
            return {"error": "MESA_NO_EXISTE"}

        disponibilidad_actual = row[0]
        disponibilidad_nueva = mesa['disponibilidad']

        # 2️⃣ Si intenta cambiar disponibilidad
        if disponibilidad_actual != disponibilidad_nueva:
            cursor.execute("""
                SELECT 1
                FROM pedidos
                WHERE id_mesa = %s
                  AND estado = 'abierto'
                LIMIT 1
            """, (id_mesa,))

            pedido_abierto = cursor.fetchone()

            if pedido_abierto:
                return {"error": "PEDIDO_ABIERTO"}

        # 3️⃣ Update permitido
        cursor.execute("""
            UPDATE mesas
            SET nombre=%s,
                capacidad=%s,
                disponibilidad=%s,
                tipo_mesa=%s
            WHERE id_mesas=%s
        """, (
            mesa['nombre'],
            mesa['capacidad'],
            mesa['disponibilidad'],
            mesa['tipo_mesa'],
            id_mesa
        ))

        conn.commit()
        return {"success": True}

    except Exception as e:
        if conn:
            conn.rollback()
        print("Error actualizar_mesa:", e)
        return {"error": "ERROR_UPDATE"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



def eliminar_mesa(id_mesa):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM mesas WHERE id_mesas=%s", (id_mesa,))
        conn.commit()
        return True
    except Exception as e:
        if conn: conn.rollback()
        print("Error eliminar_mesa:", e)
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
