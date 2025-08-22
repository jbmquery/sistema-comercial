from conexion_postgresql import get_connection

def obtener_categorias():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = "SELECT id_categoria, nombre_cat FROM categorias ORDER BY nombre_cat"
        cursor.execute(query)
        rows = cursor.fetchall()

        return [
            {"id_categoria": row[0], "nombre_cat": row[1]}
            for row in rows
        ]
    except Exception as e:
        print(f"Error al obtener categorías: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def obtener_subcategorias(categoria_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT id_subcat, nombre_subcat 
        FROM sub_categorias 
        WHERE categoria = %s 
        ORDER BY nombre_subcat
        """
        cursor.execute(query, (categoria_id,))
        rows = cursor.fetchall()

        return [
            {"id_subcat": row[0], "nombre_subcat": row[1]}
            for row in rows
        ]
    except Exception as e:
        print(f"Error al obtener subcategorías: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()