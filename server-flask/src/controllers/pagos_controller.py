# controllers/pagos_controller.py
from conexion_postgresql import get_connection

def buscar_clientes_por_dni(dni):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT 
            id_cliente,
            nombres,
            ape_paterno,
            ape_materno,
            dni,
            puntos_acumulados
        FROM clientes 
        WHERE dni ILIKE %s
        ORDER BY id_cliente
        LIMIT 10
        """
        cursor.execute(query, (f'%{dni}%',))
        rows = cursor.fetchall()

        return [
            {
                "id_cliente": row[0],
                "nombre_completo": f"{row[1]} {row[2] or ''} {row[3] or ''}".strip(),
                "dni": row[4],
                "puntos_acumulados": row[5] or 0
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error buscando clientes: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()