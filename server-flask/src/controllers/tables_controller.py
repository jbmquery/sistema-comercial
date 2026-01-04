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

        cursor.execute("""
            UPDATE mesas
            SET nombre=%s, capacidad=%s, disponibilidad=%s, tipo_mesa=%s
            WHERE id_mesas=%s
        """, (
            mesa['nombre'],
            mesa['capacidad'],
            mesa['disponibilidad'],
            mesa['tipo_mesa'],
            id_mesa
        ))

        conn.commit()
        return True
    except Exception as e:
        if conn: conn.rollback()
        print("Error actualizar_mesa:", e)
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


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
