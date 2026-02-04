from flask import jsonify
from conexion_postgresql import get_connection
from datetime import date

# ======================
# LISTAR
# ======================
def get_proveedores():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id_proveedor,nombre_proveedor,ruc_dni,celular,correo,
               direccion,estado,fecha_registro,observaciones
        FROM proveedor
        ORDER BY id_proveedor DESC
    """)

    rows = cur.fetchall()
    proveedores = []

    for r in rows:
        proveedores.append({
            "id_proveedor": r[0],
            "nombre": r[1],
            "ruc_dni": r[2],
            "celular": r[3],
            "correo": r[4],
            "direccion": r[5],
            "estado": r[6],
            "fecha_registro": str(r[7]) if r[7] else None,
            "observaciones": r[8]
        })

    cur.close()
    conn.close()
    return jsonify({"proveedores": proveedores})


# ======================
# CREAR
# ======================
def crear_proveedor(data):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO proveedor
        (nombre_proveedor, ruc_dni, celular, correo, direccion,
         estado, fecha_registro, observaciones)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id_proveedor
    """, (
        data["nombre"],
        data["ruc_dni"],
        data["celular"],
        data["correo"],
        data["direccion"],
        data["estado"],
        date.today(),
        data["observaciones"]
    ))

    nuevo_id = cur.fetchone()[0]
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Proveedor creado",
        "id_proveedor": nuevo_id
    })


# ======================
# ACTUALIZAR
# ======================
def actualizar_proveedor(id, data):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE proveedor
        SET nombre_proveedor=%s,
            ruc_dni=%s,
            celular=%s,
            correo=%s,
            direccion=%s,
            estado=%s,
            observaciones=%s
        WHERE id_proveedor=%s
    """, (
        data["nombre"],
        data["ruc_dni"],
        data["celular"],
        data["correo"],
        data["direccion"],
        data["estado"],
        data["observaciones"],
        id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Proveedor actualizado"})


# ======================
# ELIMINAR
# ======================
def eliminar_proveedor(id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM proveedor WHERE id_proveedor=%s", (id,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Proveedor eliminado"})
