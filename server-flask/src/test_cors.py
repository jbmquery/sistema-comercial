try:
    from flask_cors import CORS
    print("✅ flask-cors está instalado y se puede importar")
except ImportError as e:
    print("❌ Error: flask-cors no está instalado o no se encuentra:", e)