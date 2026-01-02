# controllers/clientes_controller.py
from conexion_postgresql import get_connection
from datetime import datetime

def obtener_todos_clientes():
    """
    Obtiene todos los clientes de la base de datos
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
        SELECT id_cliente, nombres, ape_paterno, ape_materno, celular, dni, 
               puntos_acumulados, fecha_registro, estado
        FROM clientes
        ORDER BY id_cliente
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        return [
            {
                "id_cliente": row[0],
                "nombres": row[1],
                "ape_paterno": row[2],
                "ape_materno": row[3],
                "celular": row[4],
                "dni": row[5],
                "puntos_acumulados": row[6],
                "fecha_registro": row[7].isoformat() if row[7] else None,
                "estado": row[8]
            }
            for row in rows
        ]
    except Exception as e:
        print(f"Error obteniendo clientes: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def crear_cliente(cliente):
    """
    Crea un nuevo cliente en la base de datos
    - puntos_acumulados = 0 por defecto
    - fecha_registro = fecha actual
    - estado = true por defecto
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Fecha actual
        fecha_registro = datetime.now().date()
        
        query = """
        INSERT INTO clientes (nombres, ape_paterno, ape_materno, celular, dni, 
                             puntos_acumulados, fecha_registro, estado)
        VALUES (%s, %s, %s, %s, %s, 0, %s, true)
        RETURNING id_cliente, puntos_acumulados, fecha_registro
        """
        cursor.execute(query, (
            cliente['nombres'],
            cliente['ape_paterno'],
            cliente['ape_materno'],
            cliente['celular'],
            cliente['dni'],
            fecha_registro
        ))
        
        result = cursor.fetchone()
        conn.commit()
        
        # Devolver el cliente completo con los valores generados
        return {
            "id_cliente": result[0],
            "nombres": cliente['nombres'],
            "ape_paterno": cliente['ape_paterno'],
            "ape_materno": cliente['ape_materno'],
            "celular": cliente['celular'],
            "dni": cliente['dni'],
            "puntos_acumulados": result[1],
            "fecha_registro": result[2].isoformat(),
            "estado": True
        }
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error creando cliente: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def actualizar_cliente(id_cliente, cliente):
    """
    Actualiza un cliente existente
    - No se actualizan id_cliente, puntos_acumulados ni fecha_registro
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
        UPDATE clientes
        SET nombres = %s, ape_paterno = %s, ape_materno = %s, celular = %s, dni = %s, estado = %s
        WHERE id_cliente = %s
        RETURNING id_cliente, nombres, ape_paterno, ape_materno, celular, dni, 
                  puntos_acumulados, fecha_registro, estado
        """
        cursor.execute(query, (
            cliente['nombres'],
            cliente['ape_paterno'],
            cliente['ape_materno'],
            cliente['celular'],
            cliente['dni'],
            cliente['estado'],
            id_cliente
        ))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            "id_cliente": result[0],
            "nombres": result[1],
            "ape_paterno": result[2],
            "ape_materno": result[3],
            "celular": result[4],
            "dni": result[5],
            "puntos_acumulados": result[6],
            "fecha_registro": result[7].isoformat(),
            "estado": result[8]
        } if result else None
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error actualizando cliente: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def eliminar_cliente(id_cliente):
    """
    Elimina un cliente de la base de datos
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = "DELETE FROM clientes WHERE id_cliente = %s RETURNING id_cliente"
        cursor.execute(query, (id_cliente,))
        result = cursor.fetchone()
        conn.commit()
        
        return result[0] if result else None
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error eliminando cliente: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()