from conexion_postgresql import get_connection
from flask_jwt_extended import get_jwt_identity

def obtener_mis_notificaciones():
    id_usuario = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_notificacion, tipo, titulo, descripcion,
               recomendacion, estado, fecha, hora
        FROM notificaciones
        WHERE id_usuario = %s
        ORDER BY fecha DESC, hora DESC
    """, (id_usuario,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    notificaciones = []
    for r in rows:
        notificaciones.append({
            "id_notificacion": r[0],
            "tipo": r[1],
            "titulo": r[2],
            "descripcion": r[3],
            "recomendacion": r[4],
            "estado": r[5],
            "fecha": str(r[6]),
            "hora": str(r[7])
        })

    return notificaciones


def contar_pendientes():
    id_usuario = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM notificaciones
        WHERE id_usuario = %s
        AND estado = 'pendiente'
    """, (id_usuario,))

    total = cursor.fetchone()[0]
    cursor.close()
    conn.close()

    return total


def marcar_como_visto(id_notificacion):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE notificaciones
        SET estado = 'visto'
        WHERE id_notificacion = %s
    """, (id_notificacion,))

    conn.commit()
    cursor.close()
    conn.close()
