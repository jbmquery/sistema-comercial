from conexion_postgresql import get_connection

def obtener_mesas():
    query = """
        SELECT id_mesas, nombre, capacidad, disponibilidad
        FROM mesas
        ORDER BY id_mesas
    """
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()

        mesas = []
        for row in rows:
            mesas.append({
                "id": row[0],
                "nombre": row[1],
                "capacidad": row[2],
                "disponibilidad": row[3]
            })

        return mesas
    except Exception as e:
        print(f"Error en obtener_mesas: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
