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

# ==============================
# CRUD CATEGORIAS
# ==============================

def crear_categoria(data):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO categorias (nombre_cat, descripcion)
            VALUES (%s, %s)
            RETURNING id_categoria
        """, (
            data['nombre_cat'],
            data.get('descripcion')
        ))

        conn.commit()
        return cursor.fetchone()[0]

    except Exception as e:
        if conn: conn.rollback()
        print("Error crear_categoria:", e)
        return None
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def actualizar_categoria(id_categoria, data):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE categorias
            SET nombre_cat=%s, descripcion=%s
            WHERE id_categoria=%s
        """, (
            data['nombre_cat'],
            data.get('descripcion'),
            id_categoria
        ))

        conn.commit()
        return True

    except Exception as e:
        if conn: conn.rollback()
        print("Error actualizar_categoria:", e)
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def eliminar_categoria(id_categoria):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 🚫 Bloqueo si tiene subcategorías
        cursor.execute(
            "SELECT COUNT(*) FROM sub_categorias WHERE categoria=%s",
            (id_categoria,)
        )
        if cursor.fetchone()[0] > 0:
            return "TIENE_SUBCATEGORIAS"

        cursor.execute(
            "DELETE FROM categorias WHERE id_categoria=%s",
            (id_categoria,)
        )
        conn.commit()
        return True

    except Exception as e:
        if conn: conn.rollback()
        print("Error eliminar_categoria:", e)
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==============================
# CRUD SUBCATEGORIAS
# ==============================

def crear_subcategoria(data):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO sub_categorias (nombre_subcat, descripcion, categoria)
            VALUES (%s, %s, %s)
            RETURNING id_subcat
        """, (
            data['nombre_subcat'],
            data.get('descripcion'),
            data['categoria']
        ))

        conn.commit()
        return cursor.fetchone()[0]

    except Exception as e:
        if conn: conn.rollback()
        print("Error crear_subcategoria:", e)
        return None
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def actualizar_subcategoria(id_subcat, data):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE sub_categorias
            SET nombre_subcat=%s, descripcion=%s, categoria=%s
            WHERE id_subcat=%s
        """, (
            data['nombre_subcat'],
            data.get('descripcion'),
            data['categoria'],
            id_subcat
        ))

        conn.commit()
        return True

    except Exception as e:
        if conn: conn.rollback()
        print("Error actualizar_subcategoria:", e)
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def eliminar_subcategoria(id_subcat):
    conn = cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 🚫 Bloqueo si tiene productos en carta
        cursor.execute(
            "SELECT COUNT(*) FROM carta WHERE sub_categoria=%s",
            (id_subcat,)
        )
        if cursor.fetchone()[0] > 0:
            return "TIENE_CARTA"

        cursor.execute(
            "DELETE FROM sub_categorias WHERE id_subcat=%s",
            (id_subcat,)
        )
        conn.commit()
        return True

    except Exception as e:
        if conn: conn.rollback()
        print("Error eliminar_subcategoria:", e)
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
