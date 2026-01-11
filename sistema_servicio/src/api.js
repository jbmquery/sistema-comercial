import axios from "axios";

const isLocalhost = window.location.hostname === "localhost";

const api = axios.create({
  baseURL: isLocalhost
    ? "http://localhost:5000"
    : "https://abd6ac201af5.ngrok-free.app",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export default api;

export const getMesas = async () => {
  const { data } = await api.get("/api/mesas");
  return data.mesas;
};

export const getCarta = async ({ categoria, search }) => {
  const { data } = await api.get("/api/carta", {
    params: { categoria, search },
  });
  return data.por_subcategoria || {};
};

export const crearPedido = async (pedido) => {
  const { data } = await api.post("/api/pedidos", pedido);
  return data;
};

export const pagarCuenta = async ({ idPedido, cuenta, detalles, pagos }) => {
  const { data } = await api.post(
    `/api/pedidos/${idPedido}/pagar`,
    { cuenta, detalles, pagos }
  )
  return data
}


export const getPedidoDetalle = async (idPedido) => {
  const { data } = await api.get(`/api/pedidos/${idPedido}`)
  return data
}

export const getPedidos = async () => {
  const { data } = await api.get('/api/pedidos')
  return data
}
