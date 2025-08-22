from flask import jsonify
from conexion_postgresql import get_connection
from decimal import Decimal

def obtener_productos_por_categoria_y_subcategoria(categoria, sub_categoria=None):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT 
            c.id_carta,
            c.nombre,
            c.porcion,
            c.unidad_medida,
            c.precio,
            c.url_imagen,
            c.sub_categoria,
            sc.nombre_subcat,
            cat.nombre_cat
        FROM carta c
        JOIN sub_categorias sc ON c.sub_categoria = sc.id_subcat
        JOIN categorias cat ON sc.categoria = cat.id_categoria
        WHERE 1=1
        """
        params = []

        if categoria:
            if categoria.isdigit():
                query += " AND cat.id_categoria = %s"
                params.append(int(categoria))
            else:
                query += " AND LOWER(cat.nombre_cat) = LOWER(%s)"
                params.append(categoria)

        if sub_categoria:
            if sub_categoria.isdigit():
                query += " AND sc.id_subcat = %s"
                params.append(int(sub_categoria))
            else:
                query += " AND LOWER(sc.nombre_subcat) = LOWER(%s)"
                params.append(sub_categoria)

        query += " ORDER BY sc.nombre_subcat, c.nombre"

        cursor.execute(query, params)
        rows = cursor.fetchall()

        # Agrupar por nombre_subcat
        productos_agrupados = {}
        for row in rows:
            subcat = row[7]  # nombre_subcat
            producto = {
                "id_carta": row[0],
                "nombre": row[1],
                "porcion": row[2],
                "unidad_medida": row[3],
                "precio": float(row[4]) if row[4] else 0.0,
                "url_imagen": row[5],
                "sub_categoria": row[6],
                "nombre_subcat": row[7],
                "nombre_cat": row[8]
            }
            if subcat not in productos_agrupados:
                productos_agrupados[subcat] = []
            productos_agrupados[subcat].append(producto)

        return productos_agrupados  # ← Devuelve objeto agrupado

    except Exception as e:
        print(f"Error al obtener productos: {e}")
        return {}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()