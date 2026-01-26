# server-flask/src/controllers/infoasistencia_controller.py
from conexion_postgresql import get_connection
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timedelta

def obtener_mis_asistencias():
    id_usuario = get_jwt_identity()

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            s.nombre_sede,
            t.nombre_turno,
            a.fecha,
            a.hora_entrada_real,
            a.hora_salida_real,
            a.estado_asistencia,
            a.hora_entrada_horario,
            t.tolerancia_minutos,
            a.observacion
        FROM asistencias a
        JOIN sedes s ON s.id_sede = a.id_sede
        JOIN turnos t ON t.id_turno = a.id_turno
        WHERE a.id_usuario = %s
        ORDER BY a.fecha DESC
    """, (id_usuario,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    asistencias = []

    for r in rows:
        (
            nombre_sede,
            nombre_turno,
            fecha,
            hora_entrada_real,
            hora_salida_real,
            estado,
            hora_entrada_horario,
            tolerancia,
            observacion
        ) = r

        # 🧮 Cálculo minutos tarde
        minutos_tarde = 0
        if hora_entrada_real and hora_entrada_horario:
            limite = (
                datetime.combine(fecha, hora_entrada_horario)
                + timedelta(minutes=tolerancia)
            ).time()

            diff = (
                datetime.combine(fecha, hora_entrada_real)
                - datetime.combine(fecha, limite)
            ).total_seconds() / 60

            minutos_tarde = max(0, int(diff))

        asistencias.append({
            "sede": nombre_sede,
            "turno": nombre_turno,
            "fecha": str(fecha),
            "hora_entrada": str(hora_entrada_real) if hora_entrada_real else "-",
            "hora_salida": str(hora_salida_real) if hora_salida_real else "-",
            "estado": estado,
            "minutos_tarde": minutos_tarde,
            "observacion": observacion or ""
        })

    return asistencias
