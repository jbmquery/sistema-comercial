// sistema_servicio/src/pages/EditCartaPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarAdmin.jsx";

import {
  getCategorias,
  getSubcategorias,
  getCartaAdmin,
  crearCarta,
  actualizarCarta,
  eliminarCarta,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  crearSubcategoria,
  actualizarSubcategoria,
  eliminarSubcategoria,
} from "../api";

function EditCartaPage() {
  const queryClient = useQueryClient();

  /* =======================
     ESTADOS (TAL CUAL TUYO)
  ======================= */

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [categoriaSubSeleccionada, setCategoriaSubSeleccionada] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");


  const [categoriaForm, setCategoriaForm] = useState({
    id_categoria: "",
    nombre_cat: "",
    descripcion: "",
  });

  const [subcategoriaForm, setSubcategoriaForm] = useState({
    id_subcat: "",
    nombre_subcat: "",
    descripcion: "",
    categoria: "",
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
    url_imagen: "",
  });

  const editarCarta = async (c) => {
    setCartaForm({
      id_carta: c.id_carta,
      categoria: c.categoria ?? "",
      sub_categoria: c.sub_categoria ?? "",
      nombre: c.nombre ?? "",
      grupo: c.grupo ?? "",
      abreviado: c.abreviado ?? "",
      precio: c.precio ?? "",
      puntos_canje: c.puntos_canje ?? "",
      estado: !!c.estado,
      disponible: !!c.disponible,
      porcion: c.porcion ?? "",
      unidad_medida: c.unidad_medida ?? "",
      observacion: c.observacion ?? "",
      url_imagen: c.url_imagen ?? "",
    });

    setCategoriaSubSeleccionada(c.categoria);
    document.getElementById("modal_carta").checked = true;
  };

  /* =======================
     QUERIES (JWT + AXIOS)
  ======================= */

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: subcategorias = [] } = useQuery({
    queryKey: ["subcategorias", categoriaSubSeleccionada],
    queryFn: () => getSubcategorias(categoriaSubSeleccionada),
    enabled: !!categoriaSubSeleccionada,
  });

  const { data: cartas = [] } = useQuery({
    queryKey: ["carta", filtroCategoria],
    queryFn: () => getCartaAdmin(filtroCategoria),
  });

  /* =======================
     FILTRO LOCAL (IGUAL)
  ======================= */

  const cartasFiltradas = cartas.filter((c) => {
    if (!busquedaLocal.trim()) return true;

    const texto = busquedaLocal.toLowerCase();
    return Object.entries(c).some(([key, value]) => {
      if (key === "estado" || key === "disponible") return false;
      return String(value).toLowerCase().includes(texto);
    });
  });

  const totalCoincidencias = (() => {
    if (!busquedaLocal.trim()) return 0;
    let contador = 0;
    cartas.forEach((c) => {
      Object.entries(c).forEach(([key, value]) => {
        if (key === "estado" || key === "disponible") return;
        const matches = String(value)
          .toLowerCase()
          .match(new RegExp(busquedaLocal, "gi"));
        if (matches) contador += matches.length;
      });
    });
    return contador;
  })();

  const resaltarTexto = (texto) => {
    if (!busquedaLocal.trim()) return texto;

    const regex = new RegExp(`(${busquedaLocal})`, "gi");

    return String(texto).split(regex).map((parte, i) =>
      parte.toLowerCase() === busquedaLocal.toLowerCase() ? (
        <span
          key={i}
          className="bg-warning text-black px-1 rounded"
        >
          {parte}
        </span>
      ) : (
        parte
      )
    );
  };


  /* =======================
     MUTATIONS (JWT)
  ======================= */

  const saveCategoria = useMutation({
    mutationFn: () =>
      categoriaForm.id_categoria
        ? actualizarCategoria(categoriaForm)
        : crearCategoria(categoriaForm),

    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      setMensajeOk(
        categoriaForm.id_categoria
          ? "✅ Categoría actualizada correctamente"
          : "✅ Categoría creada correctamente"
      );
      setTimeout(() => setMensajeOk(""), 2500);
    },
    onError: () => {
      setMensajeOk("❌ Error al guardar categoría");
      setTimeout(() => setMensajeOk(""), 2500);
    },
  });


  const deleteCategoria = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
    },
  });

  const saveSubcategoria = useMutation({
    mutationFn: () =>
      subcategoriaForm.id_subcat
        ? actualizarSubcategoria(subcategoriaForm)
        : crearSubcategoria(subcategoriaForm),

    onSuccess: () => {
      queryClient.invalidateQueries(["subcategorias"]);

      setMensajeOk(
        subcategoriaForm.id_subcat
          ? "✅ Subcategoría actualizada correctamente"
          : "✅ Subcategoría creada correctamente"
      );

      setTimeout(() => setMensajeOk(""), 2500);
    },

    onError: () => {
      setMensajeOk("❌ Error al guardar subcategoría");
      setTimeout(() => setMensajeOk(""), 2500);
    },
  });


  const deleteSubcategoria = useMutation({
    mutationFn: eliminarSubcategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(["subcategorias"]);
    },
  });

  const saveCarta = useMutation({
    mutationFn: () =>
      cartaForm.id_carta
        ? actualizarCarta(cartaForm)
        : crearCarta(cartaForm),

    onSuccess: () => {
      queryClient.invalidateQueries(["carta"]);

      setMensajeOk(
        cartaForm.id_carta
          ? "✅ Producto actualizado correctamente"
          : "✅ Producto creado correctamente"
      );

      setTimeout(() => setMensajeOk(""), 2500);
    },

    onError: () => {
      setMensajeOk("❌ Error al guardar producto");
      setTimeout(() => setMensajeOk(""), 2500);
    },
  });


  const deleteCarta = useMutation({
    mutationFn: eliminarCarta,
    onSuccess: () => {
      queryClient.invalidateQueries(["carta"]);
    },
  });

  /* =======================
     HANDLERS
  ======================= */

  const handleSaveCategoria = () => saveCategoria.mutate();
  const handleSaveSubcategoria = () => saveSubcategoria.mutate();
  const handleSaveCarta = () => saveCarta.mutate();
  
  const handleDeleteCategoria = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;

    deleteCategoria.mutate(id, {
      onSuccess: () => {
        setMensajeOk("Categoría eliminada correctamente");
        setTimeout(() => setMensajeOk(""), 2500);
      },
      onError: (error) => {
        if (error?.response?.data?.message) {
          setMensajeOk(`❌ ${error.response.data.message}`);
        } else {
          setMensajeOk("❌ Error al eliminar categoría");
        }
        setTimeout(() => setMensajeOk(""), 3000);
      },
    });
  };
    
  const handleDeleteSubcategoria = (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta subcategoría?")) return;

    deleteSubcategoria.mutate(id, {
      onSuccess: () => {
        setMensajeOk("Subcategoría eliminada correctamente");
        setTimeout(() => setMensajeOk(""), 2500);
      },
      onError: (error) => {
        if (error?.response?.data?.message) {
          setMensajeOk(`❌ ${error.response.data.message}`);
        } else {
          setMensajeOk("❌ Error al eliminar subcategoría");
        }
        setTimeout(() => setMensajeOk(""), 3000);
      },
    });
  };

  const handleDeleteCarta = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    deleteCarta.mutate(id, {
      onSuccess: () => {
        setMensajeOk("Producto eliminado correctamente");
        setTimeout(() => setMensajeOk(""), 2500);
      },
      onError: () => {
        setMensajeOk("❌ Error al eliminar producto");
        setTimeout(() => setMensajeOk(""), 2500);
      },
    });
  };


  return (
    <div className="w-full shadow-md">
      <div className="toast toast-top toast-center z-[9999]">
        {mensajeOk && (
            <div className="alert alert-warning mb-4">
              {mensajeOk}
            </div>
          )}
      </div>

      <HeaderCom />

      <div className="drawer lg:drawer-open bg-neutral-800">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        {/* ================= CONTENIDO ================= */}
        <div className="drawer-content p-4">
          <label
            htmlFor="my-drawer-3"
            className="btn drawer-button btn-outline btn-primary lg:hidden mb-4"
          >
            ☰
          </label>

          <h1 className="text-2xl font-bold mb-6">Gestión de Carta</h1>
          {/* ================= CATEGORIAS + SUB ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CATEGORIAS */}
            <div className="bg-black rounded shadow">
              <div className="flex flex-row justify-between items-center">
                <h2 className="font-bold p-3">Categorías</h2>
                <label
                  htmlFor="modal_categoria"
                  className="btn btn-sm btn-primary mx-2"
                >
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
                  <thead className="sticky top-0 z-0 bg-black shadow-md">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr
                        key={c.id_categoria}
                        className="hover:bg-neutral-700 cursor-pointer"
                        onClick={() => {
                          setCategoriaForm(c);
                          document.getElementById("modal_categoria").checked =
                            true;
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
                <label
                  htmlFor="modal_subcategoria"
                  className="btn btn-sm btn-primary"
                >
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
                }}
              >
                <option value="">Seleccione categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_cat}
                  </option>
                ))}
              </select>
              <div className="overflow-x-auto select-none max-h-[215px] overflow-y-auto">
                <table className="table table-sm">
                  <thead className="sticky top-0 z-0 bg-black shadow-md">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategorias.map((s) => (
                      <tr
                        key={s.id_subcat}
                        className="hover:bg-neutral-700 cursor-pointer"
                        onClick={() => {
                          setSubcategoriaForm(s);
                          document.getElementById(
                            "modal_subcategoria",
                          ).checked = true;
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
            <div className="flex items-center gap-2 md:gap-3">
              <select
                className="select select-bordered max-w-20 lg:max-w-30 bg-neutral-800"
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value);
                }}
              >
                <option value="">Categorías</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_cat}
                  </option>
                ))}
              </select>
              {/* 🔎 INPUT BUSCAR LOCAL */}
              <input
                type="text"
                placeholder="Buscar"
                className="input input-bordered bg-neutral-800 max-w-20 md:max-w-30"
                value={busquedaLocal}
                onChange={(e) => setBusquedaLocal(e.target.value)}
              />

              {/* 🧮 CONTADOR DE COINCIDENCIAS */}
              <div className=" text-xs md:text-sm opacity-80 flex flex-col md:flex-row items-center">
                <span className="mr-1">Hay </span>
                <span className="mr-1">{totalCoincidencias}</span>
                <span className="hidden md:inline">coincidencias</span>
              </div>
            </div>

            <div className="flex flex-row justify-between items-center gap-2">
              {/* Boton descargar CSV*/}
              <button
                className="btn btn-dash btn-warning btn-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                    clipRule="evenodd"
                  />
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
              <thead className="sticky top-0 z-0 bg-black shadow-md">
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
                {cartasFiltradas.map((c) => (
                  <tr
                    key={c.id_carta}
                    className="hover:bg-neutral-700 cursor-pointer"
                    onClick={() => editarCarta(c)}
                  >
                    <td>{resaltarTexto(c.id_carta)}</td>
                    <td>{resaltarTexto(c.nombre_cat)}</td>
                    <td>{resaltarTexto(c.nombre_subcat)}</td>
                    <td>{resaltarTexto(c.nombre)}</td>
                    <td>{resaltarTexto(c.grupo)}</td>
                    <td>{resaltarTexto(c.abreviado)}</td>
                    <td>S/ {resaltarTexto(c.precio)}</td>
                    <td>{resaltarTexto(c.puntos_canje)}</td>
                    <td>{resaltarTexto(c.porcion)}</td>
                    <td>{resaltarTexto(c.unidad_medida)}</td>
                    <td>{resaltarTexto(c.observacion)}</td>
                    <td>{resaltarTexto(c.estado ? "Activo" : "Inactivo")}</td>
                    <td>
                      <span
                        className={resaltarTexto(`badge ${c.disponible ? "badge-accent" : "badge-secondary"}`)}
                      >
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
            {categoriaForm.id_categoria
              ? "Editar Categoría"
              : "Nueva Categoría"}
          </h3>

          <input
            className="input input-bordered w-full my-2"
            placeholder="Nombre categoría"
            value={categoriaForm.nombre_cat}
            onChange={(e) =>
              setCategoriaForm({ ...categoriaForm, nombre_cat: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Descripción"
            value={categoriaForm.descripcion}
            onChange={(e) =>
              setCategoriaForm({
                ...categoriaForm,
                descripcion: e.target.value,
              })
            }
          />

          <div className="modal-action flex justify-between w-full">
            <label
              htmlFor="modal_categoria"
              className="btn btn-outline text-secondary"
              onClick={() =>
                setCategoriaForm({
                  id_categoria: "",
                  nombre_cat: "",
                  descripcion: "",
                })
              }
            >
              Cancelar
            </label>
            <div className="flex gap-2">
              {/* Eliminar SOLO si estamos editando */}
              {categoriaForm.id_categoria && (
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    handleDeleteCategoria(categoriaForm.id_categoria)
                  }
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
            {subcategoriaForm.id_subcat
              ? "Editar Subcategoría"
              : "Nueva Subcategoría"}
          </h3>

          <select
            className="select select-bordered w-full my-2"
            value={subcategoriaForm.categoria}
            onChange={(e) =>
              setSubcategoriaForm({
                ...subcategoriaForm,
                categoria: e.target.value,
              })
            }
          >
            <option value="">Seleccione categoría</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre_cat}
              </option>
            ))}
          </select>

          <input
            className="input input-bordered w-full my-2"
            placeholder="Nombre subcategoría"
            value={subcategoriaForm.nombre_subcat}
            onChange={(e) =>
              setSubcategoriaForm({
                ...subcategoriaForm,
                nombre_subcat: e.target.value,
              })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Descripción"
            value={subcategoriaForm.descripcion}
            onChange={(e) =>
              setSubcategoriaForm({
                ...subcategoriaForm,
                descripcion: e.target.value,
              })
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
                  categoria: "",
                })
              }
            >
              Cancelar
            </label>
            <div className="flex gap-2">
              {subcategoriaForm.id_subcat && (
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    handleDeleteSubcategoria(subcategoriaForm.id_subcat)
                  }
                >
                  Eliminar
                </button>
              )}
              <button
                className="btn btn-success"
                onClick={handleSaveSubcategoria}
              >
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
              onChange={(e) => {
                const nuevaCategoria = e.target.value;

                setCartaForm({
                  ...cartaForm,
                  categoria: nuevaCategoria,
                  sub_categoria: "",
                });

                setCategoriaSubSeleccionada(nuevaCategoria);
              }}
            >
              <option value="">Categoría</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_cat}
                </option>
              ))}
            </select>

            {/* Subcategoria */}
            <select
              className="select select-bordered"
              value={cartaForm.sub_categoria}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, sub_categoria: e.target.value })
              }
            >
              <option value="">Subcategoría</option>
              {subcategorias.map((s) => (
                <option key={s.id_subcat} value={s.id_subcat}>
                  {s.nombre_subcat}
                </option>
              ))}
            </select>

            <input
              className="input input-bordered"
              placeholder="Nombre *"
              value={cartaForm.nombre}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, nombre: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="Grupo *"
              value={cartaForm.grupo}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, grupo: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="Abreviado *"
              value={cartaForm.abreviado}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, abreviado: e.target.value })
              }
            />

            <input
              type="number"
              className="input input-bordered"
              placeholder="Precio *"
              value={cartaForm.precio}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, precio: e.target.value })
              }
            />

            <input
              type="number"
              className="input input-bordered"
              placeholder="Puntos canje *"
              value={cartaForm.puntos_canje}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, puntos_canje: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="Porción"
              value={cartaForm.porcion}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, porcion: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="Unidad medida"
              value={cartaForm.unidad_medida}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, unidad_medida: e.target.value })
              }
            />

            <input
              className="input input-bordered"
              placeholder="URL imagen"
              value={cartaForm.url_imagen}
              onChange={(e) =>
                setCartaForm({ ...cartaForm, url_imagen: e.target.value })
              }
            />
            {/* Estado */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={cartaForm.estado}
                onChange={(e) =>
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
                onChange={(e) =>
                  setCartaForm({ ...cartaForm, disponible: e.target.checked })
                }
              />
              Disponible
            </label>

            <input
              className="input input-bordered min-w-full col-span-2 md:col-span-3"
              placeholder="Observación"
              value={cartaForm.observacion}
              onChange={(e) =>
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
                  url_imagen: "",
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
      {/**Fin MODAL CARTA */}
    </div>
  );
}

export default EditCartaPage;
