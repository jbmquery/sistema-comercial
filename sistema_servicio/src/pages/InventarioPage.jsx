//sistema_servicio/src/pages/InventarioPage.jsx
import React from "react";
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarAdmin.jsx";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInsumos,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
} from "../api";

const CATEGORIAS = ["Ingrediente", "Envase", "Apoyo"];

const UNIDADES = {
  Ingrediente: [
    "Kilogramo (kg)",
    "Gramo (g)",
    "Miligramo (mg)",
    "Litro (l)",
    "Mililitro (ml)",
    "Onza (oz)",
    "Shot",
    "Cucharada",
    "Cucharita",
    "Porcion",
    "Dosis",
    "Unidad (u)",
  ],
  Envase: ["Unidad (u)", "Docena", "Paquete", "Bolsa", "Caja", "Rollo"],
  Apoyo: ["Unidad (u)", "Docena", "Paquete", "Bolsa", "Caja", "Rollo"],
};

function InventarioPage() {
  const queryClient = useQueryClient();

  const [mensajeOk, setMensajeOk] = useState("");
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [insumoForm, setInsumoForm] = useState({
    id_insumo: "",
    nombre: "",
    categoria: "",
    unidad_medida_base: "",
    estado: true,
    clase: "",
  });

  const editarInsumo = (i) => {
    setInsumoForm({
      id_insumo: i.id_insumo,
      nombre: i.nombre ?? "",
      categoria: i.categoria ?? "",
      unidad_medida_base: i.unidad_medida_base ?? "",
      estado: !!i.estado,
      clase: i.clase ?? "",
    });

    document.getElementById("modal_insumo").checked = true;
  };

  // ================= QUERY =================
  const { data: insumos = [] } = useQuery({
    queryKey: ["insumos"],
    queryFn: getInsumos,
  });

  // ================= FILTRO LOCAL =================
  const insumosFiltrados = insumos.filter((i) => {
    if (filtroCategoria && i.categoria !== filtroCategoria) return false;

    if (!busquedaLocal.trim()) return true;

    const texto = busquedaLocal.toLowerCase();

    return Object.values(i).some((v) =>
      String(v).toLowerCase().includes(texto),
    );
  });

  const clasesDisponibles = [
    ...new Set(
      insumos
        .filter((i) => i.categoria === insumoForm.categoria)
        .map((i) => i.clase)
        .filter(Boolean),
    ),
  ];

  // ================= MUTATIONS =================

  const saveInsumo = useMutation({
    mutationFn: () =>
      insumoForm.id_insumo
        ? actualizarInsumo(insumoForm)
        : crearInsumo(insumoForm),

    onSuccess: () => {
      queryClient.invalidateQueries(["insumos"]);
      setMensajeOk(
        insumoForm.id_insumo ? "✅ Insumo actualizado" : "✅ Insumo creado",
      );
      setTimeout(() => setMensajeOk(""), 2500);
    },
    onError: () => {
      setMensajeOk("❌ Error al guardar insumo");
      setTimeout(() => setMensajeOk(""), 2500);
    },
  });

  const deleteInsumo = useMutation({
    mutationFn: eliminarInsumo,
    onSuccess: () => {
      queryClient.invalidateQueries(["insumos"]);
    },
  });

  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar insumo?")) return;

    deleteInsumo.mutate(id, {
      onSuccess: () => {
        setMensajeOk("Insumo eliminado");
        setTimeout(() => setMensajeOk(""), 2500);
      },
    });
  };

  /* ----- Contador de coincidencias */

  const totalCoincidencias = (() => {
    if (!busquedaLocal.trim()) return 0;

    let contador = 0;

    insumosFiltrados.forEach((i) => {
      Object.entries(i).forEach(([key, value]) => {
        if (key === "estado") return;

        const matches = String(value)
          .toLowerCase()
          .match(new RegExp(busquedaLocal.toLowerCase(), "gi"));

        if (matches) contador += matches.length;
      });
    });

    return contador;
  })();

  /* Resaltador de coindicencias */

  const resaltarTexto = (texto) => {
    if (!busquedaLocal.trim()) return texto;

    const regex = new RegExp(`(${busquedaLocal})`, "gi");

    return String(texto)
      .split(regex)
      .map((parte, i) =>
        parte.toLowerCase() === busquedaLocal.toLowerCase() ? (
          <span key={i} className="bg-warning text-black px-1 rounded">
            {parte}
          </span>
        ) : (
          parte
        ),
      );
  };

  /* Descargar CSV */

  const descargarCSV = () => {
    if (!insumosFiltrados.length) return;

    const headers = [
      "ID",
      "Nombre",
      "Categoría",
      "Clase",
      "Unidad",
      "Estado",
      "Fecha Registro",
    ];

    const filas = insumosFiltrados.map((i) => [
      i.id_insumo,
      i.nombre,
      i.categoria,
      i.clase,
      i.unidad_medida_base,
      i.estado ? "Activo" : "Inactivo",
      i.fecha_registro,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...filas].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full shadow-md">
      <div className="toast toast-top toast-center z-[9999]">
        {mensajeOk && (
          <div className="alert alert-warning mb-4">{mensajeOk}</div>
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
          <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>
          {/* ================= FILTROS ================= */}
          <div className="pt-4 pb-4 px-2 bg-black rounded-t-lg flex flex-col gap-4">
            {/* Titulo */}
            <span className="font-bold text-lg">Lista de Insumos</span>
            <div className=" flex flex-row justify-between items-center">
              {/* Filtro Carta*/}
              <div className="flex items-center gap-2 md:gap-3">
                <select
                  className="select select-bordered max-w-20 lg:max-w-30 bg-neutral-800"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Categorías</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
                <button className="btn btn-dash btn-warning btn-sm" onClick={descargarCSV}>
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
                <label
                  htmlFor="modal_insumo"
                  className="btn btn-sm btn-primary"
                  onClick={() =>
                    setInsumoForm({
                      id_insumo: "",
                      nombre: "",
                      categoria: "",
                      unidad_medida_base: "",
                      estado: true,
                      clase: "",
                    })
                  }
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
                  <span className="hidden md:inline">Añadir Insumos</span>
                </label>
              </div>
            </div>
          </div>
          {/* ================= TABLA CARTA ================= */}
          <div className="overflow-x-auto bg-black rounded-b-lg shadow select-none max-h-[500px] overflow-y-auto">
            <table className="table table-sm">
              <thead className="sticky top-0 z-0 bg-black shadow-md">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Clase</th>
                  <th>Unidad de medida</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map((i) => (
                  <tr
                    key={i.id_insumo}
                    className="hover:bg-neutral-700 cursor-pointer"
                    onClick={() => editarInsumo(i)}
                  >
                    <td>{i.id_insumo}</td>
                    <td>{resaltarTexto(i.nombre)}</td>
                    <td>{resaltarTexto(i.categoria)}</td>
                    <td>{resaltarTexto(i.clase)}</td>
                    <td>{resaltarTexto(i.unidad_medida_base)}</td>
                    <td>{i.estado ? "Activo" : "Inactivo"}</td>
                    <td>{resaltarTexto(i.fecha_registro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* ================= SIDEBAR ================= */}
        {/* SIDEBAR */}
        <Sidebar activePage="inventario" />
        {/* FIN SIDEBAR */}
      </div>
      {/* ================= MODALES ================= */}
      <input type="checkbox" id="modal_insumo" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {insumoForm.id_insumo ? "Editar Insumo" : "Nuevo Insumo"}
          </h3>

          <input
            className="input input-bordered w-full my-2"
            placeholder="Nombre"
            value={insumoForm.nombre}
            onChange={(e) =>
              setInsumoForm({ ...insumoForm, nombre: e.target.value })
            }
          />

          <select
            className="select select-bordered w-full my-2"
            value={insumoForm.categoria}
            onChange={(e) =>
              setInsumoForm({
                ...insumoForm,
                categoria: e.target.value,
                unidad_medida_base: "",
                clase: "",
              })
            }
          >
            <option value="">Seleccione categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            list="clases_list"
            className="input input-bordered w-full my-2"
            placeholder="Clase"
            value={insumoForm.clase}
            onChange={(e) =>
              setInsumoForm({ ...insumoForm, clase: e.target.value })
            }
          />

          <datalist id="clases_list">
            {clasesDisponibles.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <select
            className="select select-bordered w-full my-2"
            value={insumoForm.unidad_medida_base}
            disabled={!insumoForm.categoria}
            onChange={(e) =>
              setInsumoForm({
                ...insumoForm,
                unidad_medida_base: e.target.value,
              })
            }
          >
            <option value="">Unidad de medida</option>
            {(UNIDADES[insumoForm.categoria] || []).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={insumoForm.estado}
              onChange={(e) =>
                setInsumoForm({ ...insumoForm, estado: e.target.checked })
              }
            />
            Activo
          </label>

          <div className="modal-action flex justify-between">
            <label
              htmlFor="modal_insumo"
              className="btn btn-outline btn-secondary"
              onClick={() =>
                setInsumoForm({
                  id_insumo: "",
                  nombre: "",
                  categoria: "",
                  unidad_medida_base: "",
                  estado: true,
                  clase: "",
                })
              }
            >
              Cancelar
            </label>

            <div className="flex gap-2">
              {insumoForm.id_insumo && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDelete(insumoForm.id_insumo)}
                >
                  Eliminar
                </button>
              )}

              <button
                className="btn btn-success"
                onClick={() => saveInsumo.mutate()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventarioPage;
