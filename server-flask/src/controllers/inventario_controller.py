# server-flask/src/controllers/inventario_controller.py
from flask import jsonify
from conexion_postgresql import get_connection
from datetime import date

# =========================
# OBTENER TODOS LOS INSUMOS
# =========================
def get_insumos():
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT id_insumo, nombre, categoria, unidad_medida_base,
               estado, fecha_registro, clase
        FROM insumos
        ORDER BY id_insumo DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    insumos = []
    for r in rows:
        insumos.append({
            "id_insumo": r[0],
            "nombre": r[1],
            "categoria": r[2],
            "unidad_medida_base": r[3],
            "estado": r[4],
            "fecha_registro": str(r[5]) if r[5] else None,
            "clase": r[6],
        })

    cursor.close()
    conn.close()

    return jsonify({"insumos": insumos})


# =========================
# CREAR INSUMO
# =========================
def crear_insumo(data):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO insumos
        (nombre, categoria, unidad_medida_base, estado, fecha_registro, clase)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id_insumo
    """

    cursor.execute(query, (
        data.get("nombre"),
        data.get("categoria"),
        data.get("unidad_medida_base"),
        data.get("estado", True),
        date.today(),
        data.get("clase"),
    ))

    new_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "message": "Insumo creado correctamente",
        "id_insumo": new_id
    })


# =========================
# ACTUALIZAR INSUMO
# =========================
def actualizar_insumo(id_insumo, data):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        UPDATE insumos
        SET nombre = %s,
            categoria = %s,
            unidad_medida_base = %s,
            estado = %s,
            clase = %s
        WHERE id_insumo = %s
    """

    cursor.execute(query, (
        data.get("nombre"),
        data.get("categoria"),
        data.get("unidad_medida_base"),
        data.get("estado"),
        data.get("clase"),
        id_insumo
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Insumo actualizado correctamente"})


# =========================
# ELIMINAR INSUMO
# =========================
def eliminar_insumo(id_insumo):
    conn = get_connection()
    cursor = conn.cursor()

    query = "DELETE FROM insumos WHERE id_insumo = %s"
    cursor.execute(query, (id_insumo,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Insumo eliminado correctamente"})
