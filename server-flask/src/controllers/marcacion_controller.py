from conexion_postgresql import get_connection

def obtener_sedes():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id_sede, nombre_sede, latitud, longitud, estado
        FROM sedes
        WHERE estado = true
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "id_sede": r[0],
            "nombre": r[1],
            "latitud": r[2],
            "longitud": r[3],
            "estado": r[4]
        } for r in rows
    ]


def obtener_turnos_por_sede(id_sede):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id_turno, nombre_turno, hora_inicio, hora_fin, tolerancia_minutos, estado
        FROM turnos
        WHERE id_sede = %s AND estado = true
    """, (id_sede,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "id_turno": r[0],
            "nombre": r[1],
            "inicio": str(r[2]),
            "fin": str(r[3]),
            "tolerancia_minutos": r[4],
            "estado": r[5]
        } for r in rows
    ]
