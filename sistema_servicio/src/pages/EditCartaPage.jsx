// sistema_servicio/src/pages/EditCartaPage.jsx
import { useEffect, useState } from "react";
import HeaderCom from "../components/header_com.jsx";
import { API_BASE } from "../config";
import { Link } from "react-router-dom";
import Sidebar from "../components/SiderbarAdmin.jsx";

function EditCartaPage() {

  /* =======================
     ESTADOS
  ======================= */

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [cartas, setCartas] = useState([]);
  
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [categoriaSubSeleccionada, setCategoriaSubSeleccionada] = useState("");

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
    fetchCartas();
  }, []);

  const fetchCategorias = async () => {
    const res = await fetch(`${API_BASE}/api/categorias`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = await res.json();
    setCategorias(data.categorias || []);
  };

  const fetchSubcategorias = async (categoriaId = "") => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }

    const res = await fetch(
      `${API_BASE}/api/subcategorias?categoria=${categoriaId}`,
      {
        headers: { "ngrok-skip-browser-warning": "true" }
      }
    );

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
  fetchSubcategorias(subcategoriaForm.categoria);
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

/* =======================
   HELPER
======================= */

const editarCarta = async (c) => {
  // 1. Setear datos base
  setCartaForm({
    id_carta: c.id_carta,
    categoria: c.categoria,
    sub_categoria: c.sub_categoria,
    nombre: c.nombre,
    grupo: c.grupo,
    abreviado: c.abreviado,
    precio: c.precio,
    puntos_canje: c.puntos_canje,
    estado: c.estado,
    disponible: c.disponible,
    porcion: c.porcion,
    unidad_medida: c.unidad_medida,
    observacion: c.observacion,
    url_imagen: c.url_imagen
  });

  // 2. Cargar subcategorías de ESA categoría
  await fetchSubcategorias(c.categoria);

  // 3. Abrir modal
  document.getElementById("modal_carta").checked = true;
};


  return (
    <div className="w-full shadow-md">
      <HeaderCom />

      <div className="drawer lg:drawer-open bg-neutral-800">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        {/* ================= CONTENIDO ================= */}
        <div className="drawer-content p-4">

          <label htmlFor="my-drawer-3" className="btn drawer-button btn-outline btn-primary lg:hidden mb-4">☰</label>

          <h1 className="text-2xl font-bold mb-6">Gestión de Carta</h1>

          {/* ================= CATEGORIAS + SUB ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CATEGORIAS */}
            <div className="bg-black rounded shadow">
              <div className="flex flex-row justify-between items-center">
                <h2 className="font-bold p-3">Categorías</h2>
                <label htmlFor="modal_categoria" className="btn btn-sm btn-primary mx-2">
                  <svg
                            width="18"
                            height="18"
                            fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                  <span className="hidden md:inline">Categoría</span>
                </label>
              </div>
              <div className="overflow-x-auto select-none max-h-[215px] overflow-y-auto">
                <table className="table table-sm">
                  <thead className="sticky top-0 z-10 bg-black shadow-md">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(c => (
                      <tr key={c.id_categoria}
                        className="hover:bg-neutral-700 cursor-pointer"
                        onClick={() => {
                          setCategoriaForm(c);
                          document.getElementById("modal_categoria").checked = true;
                        }}
                      >
                        <td>{c.id_categoria}</td>
                        <td>{c.nombre_cat}</td>
                        <td>{c.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SUBCATEGORIAS */}
            <div className="bg-black rounded shadow">
              <div className="flex flex-row justify-between items-center mx-2">
                <h2 className="font-bold p-3">Subcategorías</h2>
                <label htmlFor="modal_subcategoria" className="btn btn-sm btn-primary">
                  <svg
                            width="18"
                            height="18"
                            fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                  <span className="hidden md:inline">Subcategoría</span>
                </label>
              </div>
              <select
                  className="select select-bordered my-2 mx-3 bg-neutral-800"
                  value={categoriaSubSeleccionada}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCategoriaSubSeleccionada(value);
                    fetchSubcategorias(value);
                  }}
                >
                  <option value="">Seleccione categoría</option>
                  {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_cat}
                  </option>
                  ))}
                </select>
              <div className="overflow-x-auto select-none max-h-[215px] overflow-y-auto">
                <table className="table table-sm">
                  <thead className="sticky top-0 z-10 bg-black shadow-md">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategorias.map(s => (
                      <tr key={s.id_subcat}
                        className="hover:bg-neutral-700 cursor-pointer"
                        onClick={() => {
                          setSubcategoriaForm(s);
                          document.getElementById("modal_subcategoria").checked = true;
                        }}                   
                      >
                        <td>{s.id_subcat}</td>
                        <td>{s.nombre_subcat}</td>
                        <td>{s.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </div>

          </div>

          {/* ================= FILTRO CARTA ================= */}
          <div className="mt-8 mb-4 flex flex-row justify-between items-center mx-2">
            {/* Filtro Carta*/}
            <select
              className="select select-bordered max-w-27 lg:max-w-30 bg-neutral-800"
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                fetchCartas(e.target.value);
              }}
            >
              <option value="">Categorías</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_cat}
                </option>
              ))}
            </select>
            <div className="flex flex-row justify-between items-center gap-2">
              {/* Boton descargar CSV*/}
              <button className="btn btn-dash btn-warning btn-sm" onClick={descargarCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
                <span className="hidden md:inline">CSV</span>
              </button>
              {/* Boton agregar nuevo registro de carta*/}
              <label htmlFor="modal_carta" className="btn btn-sm btn-primary">
                  <svg
                            width="18"
                            height="18"
                            fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                <span className="hidden md:inline">Producto</span>
              </label>
            </div>
          </div>

          {/* ================= TABLA CARTA ================= */}
          <div className="overflow-x-auto bg-black rounded shadow select-none max-h-[500px] overflow-y-auto">
            <table className="table table-sm">
              <thead className="sticky top-0 z-10 bg-black shadow-md">
                <tr>
                  <th>ID</th>
                  <th>Categoría</th>
                  <th>Subcategoría</th>
                  <th className="min-w-37">Nombre</th>
                  <th className="min-w-37">Grupo</th>
                  <th className="min-w-30">Abreviado</th>
                  <th>Precio</th>
                  <th>Puntos</th>
                  <th>Porción</th>
                  <th>Unidad</th>
                  <th>Observación</th>
                  <th>Estado</th>
                  <th>Disponible</th>
                </tr>
              </thead>
              <tbody>
                {cartas.map(c => (
                  <tr key={c.id_carta}
                    className="hover:bg-neutral-700 cursor-pointer"
                    onClick={() => editarCarta(c)}
                  >
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
                    {/* <td className="truncate max-w-[120px]">{c.url_imagen}</td>*/}
                    <td>{c.estado ? "Activo" : "Inactivo"}</td>
                    <td>
                      <span className={`badge ${c.disponible ? 'badge-accent' : 'badge-secondary'}`}>
                        {c.disponible ? "Sí" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= SIDEBAR ================= */}
        {/* SIDEBAR */}
        <Sidebar activePage="carta" />
          {/* FIN SIDEBAR */}
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

          <div className="modal-action flex justify-between w-full">
            <label
                htmlFor="modal_categoria"
                className="btn btn-outline text-secondary"
                onClick={() =>
                  setCategoriaForm({ id_categoria: "", nombre_cat: "", descripcion: "" })
                }
              >
                Cancelar
            </label>
            <div className="flex gap-2">
            {/* Eliminar SOLO si estamos editando */}
            {categoriaForm.id_categoria && (
              <button
                className="btn btn-secondary"
                onClick={() => handleDeleteCategoria(categoriaForm.id_categoria)}
              >
                Eliminar
              </button>
            )}
              <button className="btn btn-success" onClick={handleSaveCategoria}>
                Guardar
              </button>
            </div>
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

          <div className="modal-action flex justify-between w-full">
            <label
              htmlFor="modal_subcategoria"
              className="btn btn-outline text-secondary"
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
            <div className="flex gap-2">
              {subcategoriaForm.id_subcat && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDeleteSubcategoria(subcategoriaForm.id_subcat)}
                >
                  Eliminar
                </button>
              )}
              <button className="btn btn-success" onClick={handleSaveSubcategoria}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* MODAL CARTA */}
      <input type="checkbox" id="modal_carta" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">
            {cartaForm.id_carta ? "Editar Producto" : "Nuevo Producto"}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

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
              placeholder="Nombre *"
              value={cartaForm.nombre}
              onChange={e => setCartaForm({ ...cartaForm, nombre: e.target.value })}
            />

            <input
              className="input input-bordered"
              placeholder="Grupo *"
              value={cartaForm.grupo}
              onChange={e => setCartaForm({ ...cartaForm, grupo: e.target.value })}
            />

            <input
              className="input input-bordered"
              placeholder="Abreviado *"
              value={cartaForm.abreviado}
              onChange={e =>
                setCartaForm({ ...cartaForm, abreviado: e.target.value })
              }
            />

            <input
              type="number"
              className="input input-bordered"
              placeholder="Precio *"
              value={cartaForm.precio}
              onChange={e => setCartaForm({ ...cartaForm, precio: e.target.value })}
            />

            <input
              type="number"
              className="input input-bordered"
              placeholder="Puntos canje *"
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
              className="input input-bordered min-w-full col-span-2 md:col-span-3"
              placeholder="Observación"
              value={cartaForm.observacion}
              onChange={e =>
                setCartaForm({ ...cartaForm, observacion: e.target.value })
              }
            />
          </div>

          <div className="modal-action flex justify-between w-full">
              <label
                htmlFor="modal_carta"
                className="btn btn-outline text-secondary"
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
            <div className="flex gap-2">
            {/* BOTÓN ELIMINAR SOLO SI ESTAMOS EDITANDO */}
            {cartaForm.id_carta && (
              <button
                className="btn btn-secondary"
                onClick={() => handleDeleteCarta(cartaForm.id_carta)}
              >
                Eliminar
              </button>
            )} 
              <button className="btn btn-success" onClick={handleSaveCarta}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default EditCartaPage;
