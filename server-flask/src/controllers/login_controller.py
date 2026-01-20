import bcrypt
from flask_jwt_extended import create_access_token
from conexion_postgresql import get_connection

def login_user(correo, password):
    query = """
        SELECT id_usuario, correo, pass_encrip, tipo_usuario, apodo
        FROM usuarios
        WHERE correo = %s AND estado = true
    """

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, (correo,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return None

    id_usuario, correo_db, pass_hash, tipo_usuario, apodo = user

    # Verificar contraseña con bcrypt
    if not bcrypt.checkpw(password.encode(), pass_hash.encode()):
        return None

    # Crear token JWT
    token = create_access_token(
        identity=str(id_usuario),
        additional_claims={
            "correo": correo_db,
            "tipo_usuario": tipo_usuario,
            "apodo": apodo
        }
    )

    return {
        "token": token,
        "usuario": {
            "id_usuario": id_usuario,
            "correo": correo_db,
            "tipo_usuario": tipo_usuario,
            "apodo": apodo
        }
    }
