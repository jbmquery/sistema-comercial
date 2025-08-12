from flask import jsonify
from conexion_postgresql import get_connection
from decimal import Decimal

def get_carta(categoria=None, search=None):
    if not categoria:
        # return jsonify({"error": "Debe indicar la categoría"}), 400
        categoria = "Bebidas"  # Default category if none provided

    try:
        conn = get_connection()
        cur = conn.cursor()

        if categoria.isdigit():
            query = """
            SELECT 
            c.id_carta,
            c.nombre,
            c.porcion,
            c.unidad_medida,
            c.precio::numeric AS precio,
            c.estado,
            c.disponible,
            c.observacion,
            cat.id_categoria,
            cat.nombre_cat,
            sub.id_subcat,
            sub.nombre_subcat,
            c.url_imagen
            FROM carta c
            JOIN categorias cat ON c.categoria = cat.id_categoria
            LEFT JOIN sub_categorias sub ON c.sub_categoria = sub.id_subcat
            WHERE cat.id_categoria = %s
            """
            params = [int(categoria)]
        else:
            query = """
            SELECT
            c.id_carta,
            c.nombre,
            c.porcion,
            c.unidad_medida,
            c.precio::numeric AS precio,
            c.estado,
            c.disponible,
            c.observacion,
            cat.id_categoria,
            cat.nombre_cat,
            sub.id_subcat,
            sub.nombre_subcat,
            c.url_imagen
            FROM carta c
            JOIN categorias cat ON c.categoria = cat.id_categoria
            LEFT JOIN sub_categorias sub ON c.sub_categoria = sub.id_subcat
            WHERE LOWER(cat.nombre_cat) = LOWER(%s)
            """
            params = [categoria]

        if search:
            query += " AND LOWER(c.nombre) LIKE LOWER(%s)"
            params.append(f"%{search}%")

        query += " ORDER BY sub.nombre_subcat NULLS LAST, c.nombre"

        cur.execute(query, params)
        rows = cur.fetchall()
        columnas = [desc[0] for desc in cur.description]

        productos = []
        for row in rows:
            item = dict(zip(columnas, row))
            # convertir precio (Decimal) a float para JSON
            precio = item.get("precio")
            if isinstance(precio, Decimal):
                item["precio"] = float(precio)
            else:
                try:
                    item["precio"] = float(precio) if precio is not None else None
                except:
                    pass

            # poner nombre de subcategoria en campo consistente
            item["sub_categoria"] = item.pop("nombre_subcat", None)
            productos.append(item)

        cur.close()
        conn.close()

        # agrupar por sub_categoria
        por_subcategoria = {}
        for p in productos:
            key = p.get("sub_categoria") or "Sin subcategoria"
            por_subcategoria.setdefault(key, []).append(p)

        return jsonify({"productos": productos, "por_subcategoria": por_subcategoria})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
