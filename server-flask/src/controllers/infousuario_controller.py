# server-flask/src/controllers/infousuario_controller.py
# AQUI VA INFORMACION TABLA USUARIOS Y EMPLEADOS
from flask_jwt_extended import get_jwt_identity
from conexion_postgresql import get_connection

def obtener_info_usuario_actual():
    id_usuario = get_jwt_identity()

    conn = get_connection()
    cur = conn.cursor()

    # ---------------- USUARIO ----------------
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

    user_row = cur.fetchone()

    if not user_row:
        cur.close()
        conn.close()
        return None

    # ---------------- EMPLEADOS / CONTRATOS ----------------
    cur.execute("""
        SELECT
            s.nombre_sede,
            e.sueldo,
            e.tipo_contrato,
            e.fecha_inicio,
            e.fecha_fin,
            e.estado,
            n.nombre AS cargo,
            e.turno_referencia
        FROM empleados e
        LEFT JOIN sedes s ON s.id_sede = e.id_sede
        LEFT JOIN niveles_usuarios n ON n.id_tipo_usuario = e.tipo_usuario
        WHERE e.id_usuario = %s
        ORDER BY e.fecha_inicio DESC
    """, (id_usuario,))

    contratos_rows = cur.fetchall()

    cur.close()
    conn.close()

    contratos = []
    for row in contratos_rows:
        contratos.append({
            "sede": row[0],
            "sueldo": row[1],
            "tipo_contrato": row[2],
            "fecha_inicio": row[3],
            "fecha_fin": row[4],
            "estado": row[5],
            "cargo": row[6],
            "turno_referencia": row[7],
        })

    return {
        "nombres": user_row[0],
        "ape_paterno": user_row[1],
        "ape_materno": user_row[2],
        "apodo": user_row[3],
        "correo": user_row[4],
        "celular": user_row[5],
        "fecha_nacimiento": user_row[6],
        "fecha_contratacion": user_row[7],
        "estado": user_row[8],
        "contratos": contratos
    }