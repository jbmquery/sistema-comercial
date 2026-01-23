// sistema_servicio/src/api.js

import axios from "axios";
import { API_BASE } from "./config";

//REFRESH TOKEN API

const isLocalhost = window.location.hostname === "localhost";

const api = axios.create({
  baseURL: isLocalhost
    ? "http://localhost:5000"
    : "https://lucienne-preadministrative-odelia.ngrok-free.dev",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export default api;

// 👉 Instancia limpia SOLO para refresh token
const refreshApi = axios.create({
  baseURL: isLocalhost
    ? "http://localhost:5000"
    : "https://lucienne-preadministrative-odelia.ngrok-free.dev",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});



api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//---Complemento del interceptor para refrescar token (opcional)---//
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si no hay response (network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // ⚠️ Evitar loop infinito
    if ((status === 401 || status === 422) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Espera a que termine el refresh en curso
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await refreshApi.post(
          "/api/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );


        const newAccessToken = data.access_token;

        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);

        // 🔥 Sesión muerta → logout
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


//-----------------------
export const getMesas = async () => {
  const { data } = await api.get("/api/mesas");
  return data.mesas;
};

// 👉 Para MenuPage (por subcategoría)
export const getCartaMenu = async ({ categoria, search }) => {
  const { data } = await api.get('/api/carta', {
    params: { categoria, search }
  })

  return data.por_subcategoria || {}
};

// 👉 Para OrdenPage (array plano)
export const getCartaOrden = async ({ categoria, sub_categoria }) => {
  const { data } = await api.get('/api/carta', {
    params: { categoria, sub_categoria }
  })

  const porSubcat = data.por_subcategoria || {}

  return Object.values(porSubcat).flat()
};


export const crearPedido = async (pedido) => {
  const { data } = await api.post("/api/pedidos", pedido);
  return data;
};

export const pagarCuenta = async ({ idPedido, payload }) => {
  const { data } = await api.post(
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
  const { data } = await api.get(
    `/api/pedidos/${idPedido}/cuenta-actual`
  );
  return data;
};


export const agregarDetallePedido = async ({ idPedido, payload }) => {
  const { data } = await api.post(
    `/api/pedidos/${idPedido}/detalle`,
    payload
  )
  return data
}

export const actualizarEstadoDetalle = async ({ idDetalle, estado }) => {
  const { data } = await api.put(
    `/api/detalle/${idDetalle}/estado`,
    { estado }
  )
  return data
}

export const actualizarObservacionDetalle = async ({ idDetalle, observacion }) => {
  const { data } = await api.put(
    `/api/detalle/${idDetalle}/observacion`,
    { observacion }
  )
  return data
}


export const imprimirCocina = async ({ idPedido, detalles }) => {
  const res = await api.post(
    `/api/impresiones/cocina/${idPedido}`,
    { detalles },
    { responseType: 'blob' }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `cocina_pedido_${idPedido}.pdf`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};



export const imprimirVoucher = async ({ idPedido, detalles }) => {
  const res = await api.post(
    `/api/impresiones/voucher/${idPedido}`,
    { detalles },
    { responseType: 'blob' }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `voucher_pago_${idPedido}.pdf`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const generarVoucherWhatsapp = async ({ idPedido, detalles }) => {
  const { data } = await api.post(
    `/api/impresiones/voucher-whatsapp/${idPedido}`,
    { detalles }
  );

  return data.texto;
};


export const getProductosVendidosDia = async (fecha) => {
  const { data } = await api.get("/api/ventas-dia/productos", {
    params: { fecha }
  });

  return data.productos_vendidos;
};

export const getProductosPerdidaDia = async (fecha) => {
  const { data } = await api.get("/api/ventas-dia/perdidas", {
    params: { fecha }
  });

  return data.productos_perdida;
};

export const getTiposVentaDia = async (fecha) => {
  const { data } = await api.get("/api/ventas-dia/tipos-venta", {
    params: { fecha }
  });

  return data.tipos_venta;
};

export const getVentasMesasDia = async (fecha) => {
  const { data } = await api.get("/api/ventas-dia/mesas", {
    params: { fecha }
  });

  return data.ventas_mesas;
};

export const getResumenPedidosDia = async (fecha) => {
  const { data } = await api.get("/api/ventas-dia/resumen-pedidos", {
    params: { fecha }
  });

  return data.resumen_pedidos;
};

export const getCajaDia = async (fecha) => {
  const { data } = await api.get("/api/ventas-dia/caja", {
    params: { fecha }
  });

  return data.caja;
};

export const getDetallePedidoVentasDia = async (idPedido) => {
  const { data } = await api.get(
    `/api/ventas-dia/pedido-detalle/${idPedido}`
  );
  return data; 
};


// =====================
// CATEGORÍAS
// =====================
export const getCategorias = async () => {
  const { data } = await api.get("/api/categorias");
  return data.categorias || [];
};

// =====================
// SUBCATEGORÍAS
// =====================
export const getSubcategorias = async (categoria) => {
  if (!categoria) return [];
  const { data } = await api.get("/api/subcategorias", {
    params: { categoria }
  });
  return data.subcategorias || [];
};

// =====================
// CARTA (ADMIN)
// =====================
export const getCartaAdmin = async (categoria) => {
  const { data } = await api.get("/api/carta", {
    params: categoria ? { categoria } : {}
  });

  return Object.values(data.por_subcategoria || {}).flat();
};

  // ===== CARTA EditCartaPage=====
  export const crearCarta = (payload) => api.post("/api/carta", payload);
  export const actualizarCarta = (payload) =>
    api.put(`/api/carta/${payload.id_carta}`, payload);
  export const eliminarCarta = (id) => api.delete(`/api/carta/${id}`);

  // ===== CATEGORIAS =====
  export const crearCategoria = (payload) =>
    api.post("/api/categorias", payload);
  export const actualizarCategoria = (payload) =>
    api.put(`/api/categorias/${payload.id_categoria}`, payload);
  export const eliminarCategoria = (id) => api.delete(`/api/categorias/${id}`);

  // ===== SUBCATEGORIAS =====
  export const crearSubcategoria = (payload) =>
    api.post("/api/subcategorias", payload);
  export const actualizarSubcategoria = (payload) =>
    api.put(`/api/subcategorias/${payload.id_subcat}`, payload);
  export const eliminarSubcategoria = (id) =>
    api.delete(`/api/subcategorias/${id}`);

  //marcacion asistencia-----------------------------

  export const marcarAsistencia = async ({ id_turno, id_sede }) => {
    const { data } = await api.post("/api/asistencias/marcar", {
      id_turno,
      id_sede
    });
    return data;
  };
