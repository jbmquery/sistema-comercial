#server-flask/src/main.py

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super_clave_secreta_cafe"
jwt = JWTManager(app)

# Define los orígenes permitidos
origins = [
    "http://localhost:5173",           # ← Frontend en desarrollo
    "https://climbable-mason-uneroded.ngrok-free.dev"  # ← URL de tu frontend en ngrok
]

##CORS(app, origins=origins, supports_credentials=True)
CORS(
    app,
    resources={r"/api/*": {"origins": origins}},
    supports_credentials=True
)

#Registra blueprints
from routes.login_routes import login_bp
from routes.tables_routes import tables_bp
from routes.carta_routes import carta_bp
from routes.categorias_routes import categorias_bp
from routes.clientes_routes import clientes_bp
from routes.orden_routes import orden_bp
from routes.pedidos_routes import pedidos_bp
from routes.pagos_routes import pagos_bp
from routes.cuenta_routes import cuenta_routes
from routes.impresiones_routes import impresiones_bp
from routes.ventas_dia_routes import ventas_dia_bp


app.register_blueprint(login_bp, url_prefix='/api')
app.register_blueprint(tables_bp)
app.register_blueprint(carta_bp)
app.register_blueprint(categorias_bp)
app.register_blueprint(clientes_bp)
app.register_blueprint(orden_bp)
app.register_blueprint(pedidos_bp)
app.register_blueprint(pagos_bp)
app.register_blueprint(cuenta_routes, url_prefix='/api')
app.register_blueprint(impresiones_bp, url_prefix="/api")
app.register_blueprint(ventas_dia_bp)


if __name__ == '__main__':
    app.run(debug=True)