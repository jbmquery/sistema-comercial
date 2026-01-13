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

export const getCarta = async ({ categoria, sub_categoria, search }) => {
  const { data } = await api.get("/api/carta", {
    params: { categoria, sub_categoria, search },
  })

  const porSubcat = data.por_subcategoria || {}

  // 🔥 Convertir objeto → array plano
  const productos = Object.values(porSubcat).flat()

  return productos
};

export const crearPedido = async (pedido) => {
  const { data } = await api.post("/api/pedidos", pedido);
  return data;
};

export const pagarCuenta = async ({ idPedido, payload }) => {
  const { data } = await axios.post(
    `/api/pedidos/${idPedido}/pagar`,
    payload
  )
  return data
}

export const getPedidos = async () => {
  const { data } = await api.get('/api/pedidos')
  return data
}

export const getPedidoDetalle = async (idPedido) => {
  const { data } = await api.get(`/api/pedidos/${idPedido}`)
  return data
}

export const getCuentaActual = async (idPedido) => {
  const res = await fetch(
    `/api/pedidos/${idPedido}/cuenta-actual`
  )

  if (!res.ok) {
    throw new Error('Error al obtener cuenta actual')
  }

  return res.json()
}

export const agregarDetallePedido = async ({ idPedido, payload }) => {
  const { data } = await api.post(
    `/api/pedidos/${idPedido}/detalle`,
    payload
  )
  return data
}
