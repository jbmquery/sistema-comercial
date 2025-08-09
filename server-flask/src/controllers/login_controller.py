from conexion_postgresql import get_connection

def login_user(correo, password):
    query = """
        SELECT id_usuario, correo
        FROM usuarios
        WHERE correo = %s AND pass_encrip = %s
    """

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, (correo, password))
        result = cursor.fetchone()
        if result:
            return {"id_usuario": result[0], "correo": result[1]}
        else:
            return None
    except Exception as e:
        print(f"Error en login_user: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()