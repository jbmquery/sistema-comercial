#server-flask/src/main.py

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta


app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super_clave_secreta_cafe"

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

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
from routes.refresh_routes import refresh_bp
from routes.marcacion_routes import marcacion_bp
from routes.infousuario_routes import infousuario_bp
from routes.infoasistencia_routes import infoasistencia_bp
from routes.notificaciones_routes import notificaciones_bp
from routes.inventario_routes import inventario_bp
from routes.proveedores_routes import proveedores_bp



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
app.register_blueprint(refresh_bp)
app.register_blueprint(marcacion_bp)
app.register_blueprint(infousuario_bp)
app.register_blueprint(infoasistencia_bp)
app.register_blueprint(notificaciones_bp)
app.register_blueprint(inventario_bp, url_prefix='/api')
app.register_blueprint(proveedores_bp, url_prefix='/api')


if __name__ == '__main__':
    app.run(debug=True)