# server-flask/src/controllers/infousuario_controller.py
from flask_jwt_extended import get_jwt_identity
from conexion_postgresql import get_connection

def obtener_info_usuario_actual():
    id_usuario = get_jwt_identity()  # 👈 viene del JWT

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            nombres,
            ape_paterno,
            ape_materno,
            apodo,
            correo,
            celular,
            fecha_nacimiento,
            fecha_contratacion,
            estado
        FROM usuarios
        WHERE id_usuario = %s
    """, (id_usuario,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return None

    return {
        "nombres": row[0],
        "ape_paterno": row[1],
        "ape_materno": row[2],
        "apodo": row[3],
        "correo": row[4],
        "celular": row[5],
        "fecha_nacimiento": row[6],
        "fecha_contratacion": row[7],
        "estado": row[8]
    }
