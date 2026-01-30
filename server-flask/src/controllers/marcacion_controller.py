# server-flask/src/controllers/marcacion_controller.py
from conexion_postgresql import get_connection
from datetime import date, datetime, timedelta
from flask_jwt_extended import get_jwt_identity


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

def obtener_asistencia_hoy(id_usuario, id_turno):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id_asistencia, hora_entrada_real, hora_salida_real
        FROM asistencias
        WHERE id_usuario = %s
          AND id_turno = %s
          AND fecha = CURRENT_DATE
    """, (id_usuario, id_turno))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return None

    return {
        "id_asistencia": row[0],
        "hora_entrada": row[1],
        "hora_salida": row[2]
    }

def registrar_entrada(id_usuario, id_sede, id_turno):
    conn = get_connection()
    cur = conn.cursor()

    # Obtener datos del turno
    cur.execute("""
        SELECT hora_inicio, hora_fin, tolerancia_minutos
        FROM turnos
        WHERE id_turno = %s
    """, (id_turno,))
    turno = cur.fetchone()

    if not turno:
        cur.close()
        conn.close()
        return {"error": "Turno no encontrado"}

    hora_inicio, hora_fin, tolerancia = turno
    ahora_dt = datetime.now()
    hoy = date.today()

    # 🔒 LÍMITE: solo 30 min antes del inicio
    inicio_turno_dt = datetime.combine(hoy, hora_inicio)
    limite_anticipacion = inicio_turno_dt - timedelta(minutes=30)

    if ahora_dt < limite_anticipacion:
        cur.close()
        conn.close()
        return {
            "error": "Aún no puedes marcar asistencia. Solo se permite desde 30 minutos antes del inicio del turno."
        }

    ahora = ahora_dt.time()

    # Determinar estado (puntual / tarde)
    hora_inicio_con_tolerancia = (
        inicio_turno_dt + timedelta(minutes=tolerancia)
    ).time()

    estado = "puntual"
    if ahora > hora_inicio_con_tolerancia:
        estado = "tarde"

    cur.execute("""
        INSERT INTO asistencias (
            id_usuario,
            id_sede,
            id_turno,
            fecha,
            hora_entrada_real,
            hora_entrada_horario,
            hora_salida_horario,
            estado_asistencia
        )
        VALUES (%s, %s, %s, CURRENT_DATE, %s, %s, %s, %s)
        RETURNING id_asistencia
    """, (
        id_usuario,
        id_sede,
        id_turno,
        ahora,
        hora_inicio,
        hora_fin,
        estado
    ))

    id_asistencia = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "tipo": "entrada",
        "estado": estado,
        "id_asistencia": id_asistencia
    }


def registrar_salida(asistencia_id):
    conn = get_connection()
    cur = conn.cursor()

    ahora_dt = datetime.now()

    # Obtener hora de entrada y salida programada
    cur.execute("""
        SELECT hora_entrada_real, hora_salida_horario
        FROM asistencias
        WHERE id_asistencia = %s
    """, (asistencia_id,))

    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return {"error": "Asistencia no encontrada"}

    hora_entrada_real = row[0]
    hora_salida_horario = row[1]

    # ⏱️ Validación: mínimo 5 minutos desde la entrada
    entrada_dt = datetime.combine(date.today(), hora_entrada_real)
    diferencia = ahora_dt - entrada_dt

    if diferencia < timedelta(minutes=5):
        cur.close()
        conn.close()
        return {
            "error": "Ya marcó su ingreso"
        }

    ahora = ahora_dt.time()

    # Registrar salida
    if hora_salida_horario and ahora < hora_salida_horario:
        cur.execute("""
            UPDATE asistencias
            SET hora_salida_real = %s,
                observacion = %s
            WHERE id_asistencia = %s
        """, (ahora, "Salida antes de tiempo", asistencia_id))
    else:
        cur.execute("""
            UPDATE asistencias
            SET hora_salida_real = %s
            WHERE id_asistencia = %s
        """, (ahora, asistencia_id))

    conn.commit()
    cur.close()
    conn.close()

    return {
        "tipo": "salida",
        "hora_salida": str(ahora),
        "observacion": (
            "Salida antes de tiempo"
            if hora_salida_horario and ahora < hora_salida_horario
            else None
        )
    }
