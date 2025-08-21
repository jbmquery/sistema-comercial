from flask import Flask
from flask_cors import CORS
from routes.login_routes import login_bp
from routes.tables_routes import tables_bp
from routes.carta_routes import carta_bp
from routes.pedido_routes import pedido_bp
from routes.pedidos_routes import pedidos_bp
from routes.detalle_pedido_routes import detalle_pedido_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(login_bp)
app.register_blueprint(tables_bp)
app.register_blueprint(carta_bp)
app.register_blueprint(pedido_bp)
app.register_blueprint(pedidos_bp)
app.register_blueprint(detalle_pedido_bp)

if __name__ == '__main__':
    app.run(debug=True)