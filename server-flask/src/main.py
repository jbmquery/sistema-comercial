from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Define los orígenes permitidos
origins = [
    "http://localhost:5173",           # ← Frontend en desarrollo
    "https://8ec7dd4fa1b6.ngrok-free.app"  # ← URL de tu frontend en ngrok
]

CORS(app, origins=origins, supports_credentials=True)

#Registra blueprints
from routes.login_routes import login_bp
from routes.tables_routes import tables_bp
from routes.carta_routes import carta_bp
from routes.pedido_routes import pedido_bp
from routes.pedidos_routes import pedidos_bp
from routes.detalle_pedido_routes import detalle_pedido_bp
from routes.categorias_routes import categorias_bp
from routes.pagos_routes import pagos_bp
from routes.dividir_producto_routes import dividir_bp


app.register_blueprint(login_bp)
app.register_blueprint(tables_bp)
app.register_blueprint(carta_bp)
app.register_blueprint(pedido_bp)
app.register_blueprint(pedidos_bp)
app.register_blueprint(detalle_pedido_bp)
app.register_blueprint(categorias_bp)
app.register_blueprint(pagos_bp)
app.register_blueprint(dividir_bp)

if __name__ == '__main__':
    app.run(debug=True)