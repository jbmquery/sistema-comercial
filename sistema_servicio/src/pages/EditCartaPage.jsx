import { useEffect, useState } from "react";
import HeaderCom from "../components/header_com.jsx";
import { API_BASE } from "../config";
import { Link } from "react-router-dom";

function EditCartaPage() {

  /* =======================
     ESTADOS
  ======================= */

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [cartas, setCartas] = useState([]);

  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [categoriaForm, setCategoriaForm] = useState({
    id_categoria: "",
    nombre_cat: "",
    descripcion: ""
  });

  const [subcategoriaForm, setSubcategoriaForm] = useState({
    id_subcat: "",
    nombre_subcat: "",
    descripcion: "",
    categoria: ""
  });

  const [cartaForm, setCartaForm] = useState({
    id_carta: "",
    categoria: "",
    sub_categoria: "",
    nombre: "",
    grupo: "",
    abreviado: "",
    precio: "",
    puntos_canje: "",
    estado: true,
    disponible: true,
    porcion: "",
    unidad_medida: "",
    observacion: "",
    url_imagen: ""
  });

  /* =======================
     DATA
  ======================= */

  useEffect(() => {
    fetchCategorias();
    fetchSubcategorias();
    fetchCartas();
  }, []);

  const fetchCategorias = async () => {
    const res = await fetch(`${API_BASE}/api/categorias`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = await res.json();
    setCategorias(data.categorias || []);
  };

  const fetchSubcategorias = async () => {
    const res = await fetch(`${API_BASE}/api/subcategorias`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = await res.json();
    setSubcategorias(data.subcategorias || []);
  };

  const fetchCartas = async (categoriaId = "") => {
    const url = categoriaId
      ? `${API_BASE}/api/carta?categoria=${categoriaId}`
      : `${API_BASE}/api/carta`;

    const res = await fetch(url, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });

    const data = await res.json();
    setCartas(Object.values(data.por_subcategoria || {}).flat());
  };

  /* =======================
     CSV
  ======================= */

  const descargarCSV = () => {
    if (!cartas.length) return;

    const headers = Object.keys(cartas[0]).join(",");
    const rows = cartas.map(c =>
      Object.values(c).map(v => `"${v ?? ""}"`).join(",")
    );

    const blob = new Blob(
      [headers + "\n" + rows.join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "carta.csv";
    link.click();
  };

  /* =======================
   HANDLERS CATEGORIA
======================= */

const handleSaveCategoria = async () => {
  const method = categoriaForm.id_categoria ? "PUT" : "POST";
  const url = categoriaForm.id_categoria
    ? `${API_BASE}/api/categorias/${categoriaForm.id_categoria}`
    : `${API_BASE}/api/categorias`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(categoriaForm)
  });

  const data = await res.json();
  alert(data.message);
  fetchCategorias();
};

const handleDeleteCategoria = async (id) => {
  if (!confirm("¿Eliminar categoría?")) return;

  const res = await fetch(`${API_BASE}/api/categorias/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" }
  });

  const data = await res.json();
  alert(data.message);
  fetchCategorias();
};


/* =======================
   HANDLERS SUBCATEGORIA
======================= */

const handleSaveSubcategoria = async () => {
  const method = subcategoriaForm.id_subcat ? "PUT" : "POST";
  const url = subcategoriaForm.id_subcat
    ? `${API_BASE}/api/subcategorias/${subcategoriaForm.id_subcat}`
    : `${API_BASE}/api/subcategorias`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(subcategoriaForm)
  });

  const data = await res.json();
  alert(data.message);
  fetchSubcategorias();
};

const handleDeleteSubcategoria = async (id) => {
  if (!confirm("¿Eliminar subcategoría?")) return;

  const res = await fetch(`${API_BASE}/api/subcategorias/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" }
  });

  const data = await res.json();
  alert(data.message);
  fetchSubcategorias();
};


/* =======================
   HANDLERS CARTA
======================= */

const handleSaveCarta = async () => {
  const method = cartaForm.id_carta ? "PUT" : "POST";
  const url = cartaForm.id_carta
    ? `${API_BASE}/api/carta/${cartaForm.id_carta}`
    : `${API_BASE}/api/carta`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(cartaForm)
  });

  const data = await res.json();
  alert(data.message);
  fetchCartas(filtroCategoria);
};

const handleDeleteCarta = async (id) => {
  if (!confirm("¿Eliminar producto?")) return;

  const res = await fetch(`${API_BASE}/api/carta/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" }
  });

  const data = await res.json();
  alert(data.message);
  fetchCartas(filtroCategoria);
};


  return (
    <div className="w-full shadow-md">
      <HeaderCom />

      <div className="drawer lg:drawer-open">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        {/* ================= CONTENIDO ================= */}
        <div className="drawer-content p-4">

          <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden mb-4">☰</label>

          <h1 className="text-2xl font-bold mb-6">Gestión de Carta</h1>

          {/* ================= BOTONES ================= */}
          <div className="flex flex-wrap gap-2 mb-6">
            <label htmlFor="modal_categoria" className="btn btn-sm btn-primary">Nueva Categoría</label>
            <label htmlFor="modal_subcategoria" className="btn btn-sm btn-secondary">Nueva Subcategoría</label>
            <label htmlFor="modal_carta" className="btn btn-sm btn-accent">Nuevo Producto</label>
          </div>

          {/* ================= CATEGORIAS + SUB ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CATEGORIAS */}
            <div className="overflow-x-auto bg-white rounded shadow">
              <h2 className="font-bold p-3">Categorías</h2>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map(c => (
                    <tr key={c.id_categoria}>
                      <td>{c.id_categoria}</td>
                      <td>{c.nombre_cat}</td>
                      <td>{c.descripcion}</td>
                      <td className="flex gap-1">
                        <button
                          className="btn btn-xs"
                          onClick={() => setCategoriaForm(c)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleDeleteCategoria(c.id_categoria)}
                        >
                          Eliminar
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUBCATEGORIAS */}
            <div className="overflow-x-auto bg-white rounded shadow">
              <h2 className="font-bold p-3">Subcategorías</h2>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategorias.map(s => (
                    <tr key={s.id_subcat}>
                      <td>{s.id_subcat}</td>
                      <td>{s.nombre_subcat}</td>
                      <td>{s.nombre_cat}</td>
                      <td>{s.descripcion}</td>
                      <td className="flex gap-1">
                        <button
                          className="btn btn-xs"
                          onClick={() => setSubcategoriaForm(s)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleDeleteSubcategoria(s.id_subcat)}
                        >
                          Eliminar
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* ================= FILTRO CARTA ================= */}
          <div className="mt-8 mb-4">
            <select
              className="select select-bordered max-w-xs"
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                fetchCartas(e.target.value);
              }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_cat}
                </option>
              ))}
            </select>
          </div>

          {/* ================= TABLA CARTA ================= */}
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Categoría</th>
                  <th>Subcategoría</th>
                  <th>Nombre</th>
                  <th>Grupo</th>
                  <th>Abreviado</th>
                  <th>Precio</th>
                  <th>Puntos</th>
                  <th>Porción</th>
                  <th>Unidad</th>
                  <th>Observación</th>
                  <th>Imagen</th>
                  <th>Estado</th>
                  <th>Disponible</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cartas.map(c => (
                  <tr key={c.id_carta}>
                    <td>{c.id_carta}</td>
                    <td>{c.nombre_cat}</td>
                    <td>{c.nombre_subcat}</td>
                    <td>{c.nombre}</td>
                    <td>{c.grupo}</td>
                    <td>{c.abreviado}</td>
                    <td>S/ {c.precio}</td>
                    <td>{c.puntos_canje}</td>
                    <td>{c.porcion}</td>
                    <td>{c.unidad_medida}</td>
                    <td>{c.observacion}</td>
                    <td className="truncate max-w-[120px]">{c.url_imagen}</td>
                    <td>{c.estado ? "Activo" : "Inactivo"}</td>
                    <td>{c.disponible ? "Sí" : "No"}</td>
                    <td className="flex gap-1">
                      <label htmlFor="modal_carta" className="btn btn-xs">Editar</label>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteCarta(c.id_carta)}
                      >
                        Eliminar
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-outline btn-sm mt-4" onClick={descargarCSV}>
            Descargar CSV
          </button>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 w-80 p-4">
            <li><Link to="/edit-tables">Mesas</Link></li>
            <li>
              <Link className="active bg-secondary text-secondary-content" to="/edit-carta">
                Carta
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= MODALES ================= */}

      {/* MODAL CATEGORIA */}
      <input type="checkbox" id="modal_categoria" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">
            {categoriaForm.id_categoria ? "Editar Categoría" : "Nueva Categoría"}
          </h3>

          <input
            className="input input-bordered w-full my-2"
            placeholder="Nombre categoría"
            value={categoriaForm.nombre_cat}
            onChange={e =>
              setCategoriaForm({ ...categoriaForm, nombre_cat: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Descripción"
            value={categoriaForm.descripcion}
            onChange={e =>
              setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })
            }
          />

          <div className="modal-action">
            <label
              htmlFor="modal_categoria"
              className="btn btn-outline"
              onClick={() =>
                setCategoriaForm({ id_categoria: "", nombre_cat: "", descripcion: "" })
              }
            >
              Cancelar
            </label>
            <button className="btn btn-primary" onClick={handleSaveCategoria}>
              Guardar
            </button>
          </div>
        </div>
      </div>


      {/* MODAL SUBCATEGORIA */}
      <input type="checkbox" id="modal_subcategoria" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">
            {subcategoriaForm.id_subcat ? "Editar Subcategoría" : "Nueva Subcategoría"}
          </h3>

          <select
            className="select select-bordered w-full my-2"
            value={subcategoriaForm.categoria}
            onChange={e =>
              setSubcategoriaForm({ ...subcategoriaForm, categoria: e.target.value })
            }
          >
            <option value="">Seleccione categoría</option>
            {categorias.map(c => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre_cat}
              </option>
            ))}
          </select>

          <input
            className="input input-bordered w-full my-2"
            placeholder="Nombre subcategoría"
            value={subcategoriaForm.nombre_subcat}
            onChange={e =>
              setSubcategoriaForm({ ...subcategoriaForm, nombre_subcat: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Descripción"
            value={subcategoriaForm.descripcion}
            onChange={e =>
              setSubcategoriaForm({ ...subcategoriaForm, descripcion: e.target.value })
            }
          />

          <div className="modal-action">
            <label
              htmlFor="modal_subcategoria"
              className="btn btn-outline"
              onClick={() =>
                setSubcategoriaForm({
                  id_subcat: "",
                  nombre_subcat: "",
                  descripcion: "",
                  categoria: ""
                })
              }
            >
              Cancelar
            </label>
            <button className="btn btn-primary" onClick={handleSaveSubcategoria}>
              Guardar
            </button>
          </div>
        </div>
      </div>


      {/* MODAL CARTA */}
      <input type="checkbox" id="modal_carta" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-5xl">
          <h3 className="font-bold text-lg mb-4">
            {cartaForm.id_carta ? "Editar Producto" : "Nuevo Producto"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Categoria */}
            <select
              className="select select-bordered"
              value={cartaForm.categoria}
              onChange={e => {
                setCartaForm({
                  ...cartaForm,
                  categoria: e.target.value,
                  sub_categoria: ""
                });
                fetchSubcategorias(e.target.value);
              }}
            >
              <option value="">Categoría</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_cat}
                </option>
              ))}
            </select>

            {/* Subcategoria */}
            <select
              className="select select-bordered"
              value={cartaForm.sub_categoria}
              onChange={e =>
                setCartaForm({ ...cartaForm, sub_categoria: e.target.value })
              }
            >
              <option value="">Subcategoría</option>
              {subcategorias.map(s => (
                <option key={s.id_subcat} value={s.id_subcat}>
                  {s.nombre_subcat}
                </option>
              ))}
            </select>

            <input
              className="input input-bordered"
              placeholder="Nombre"
              value={cartaForm.nombre}
              onChange={e => setCartaForm({ ...cartaForm, nombre: e.target.value })}
            />

            <input
              className="input input-bordered"
              placeholder="Grupo"
              value={cartaForm.grupo}
              onChange={e => setCartaForm({ ...cartaForm, grupo: e.target.value })}
            />

            <input
              className="input input-bordered"
              placeholder="Abreviado"
              value={cartaForm.abreviado}
              onChange={e =>
                setCartaForm({ ...cartaForm, abreviado: e.target.value })
              }
            />

            <input
              type="number"
              className="input input-bordered"
              placeholder="Precio"
              value={cartaForm.precio}
              onChange={e => setCartaForm({ ...cartaForm, precio: e.target.value })}
            />

            <input
              type="number"
              className="input input-bordered"
              placeholder="Puntos canje"
              value={cartaForm.puntos_canje}
              onChange={e =>
                setCartaForm({ ...cartaForm, puntos_canje: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="Porción"
              value={cartaForm.porcion}
              onChange={e => setCartaForm({ ...cartaForm, porcion: e.target.value })}
            />

            <input
              className="input input-bordered"
              placeholder="Unidad medida"
              value={cartaForm.unidad_medida}
              onChange={e =>
                setCartaForm({ ...cartaForm, unidad_medida: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="URL imagen"
              value={cartaForm.url_imagen}
              onChange={e =>
                setCartaForm({ ...cartaForm, url_imagen: e.target.value })
              }
            />

            {/* Estado */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={cartaForm.estado}
                onChange={e =>
                  setCartaForm({ ...cartaForm, estado: e.target.checked })
                }
              />
              Activo
            </label>

            {/* Disponible */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={cartaForm.disponible}
                onChange={e =>
                  setCartaForm({ ...cartaForm, disponible: e.target.checked })
                }
              />
              Disponible
            </label>

            <input
              className="input input-bordered md:col-span-3"
              placeholder="Observación"
              value={cartaForm.observacion}
              onChange={e =>
                setCartaForm({ ...cartaForm, observacion: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <label
              htmlFor="modal_carta"
              className="btn btn-outline"
              onClick={() =>
                setCartaForm({
                  id_carta: "",
                  categoria: "",
                  sub_categoria: "",
                  nombre: "",
                  grupo: "",
                  abreviado: "",
                  precio: "",
                  puntos_canje: "",
                  estado: true,
                  disponible: true,
                  porcion: "",
                  unidad_medida: "",
                  observacion: "",
                  url_imagen: ""
                })
              }
            >
              Cancelar
            </label>
            <button className="btn btn-primary" onClick={handleSaveCarta}>
              Guardar
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

export default EditCartaPage;
