import { Link } from 'react-router-dom'
import HeaderNav from '../components/header_nav.jsx'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pagarCuenta, getPedidoDetalle, getCuentaActual } from '../api'
import { useParams } from 'react-router-dom'
import { getPedidos } from '../api'
import { useState, useEffect } from 'react'






function OrdenPage() {

const [seleccionados, setSeleccionados] = useState([])
const { idPedido } = useParams()
const [showModal, setShowModal] = useState(false)
const [mostrarModalPago, setMostrarModalPago] = useState(false)
const [pagos, setPagos] = useState([
  { metodo: 'efectivo', monto: '' }
])
const [mensajeOk, setMensajeOk] = useState('')




//CheckBox Logic

const toggleDetalle = (id) => {
  setSeleccionados(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  )
}


// Resumen de cuenta



// useMutation para actualizar estado del detalle
const queryClient = useQueryClient()


const pagarMutation = useMutation({
  mutationFn: pagarCuenta,
  onSuccess: (res) => {
    // 🟢 Mensaje de confirmación
    setMensajeOk(`Pago registrado correctamente. Cuenta ${res.cuenta}`)


    // 🔄 Refrescar datos
    queryClient.invalidateQueries(['pedido', idPedido])
    queryClient.invalidateQueries(['pedidos'])
    queryClient.invalidateQueries(['cuentaActual', idPedido])


    // 🧹 Reset UI
    setSeleccionados([])
    setPagos([{ metodo: 'efectivo', monto: '' }])
    setMostrarModalPago(false)
    setTimeout(() => setMensajeOk(''), 3000)
  },
  onError: (err) => {
    alert(
      err.response?.data?.error ||
      '❌ Error al procesar el pago'
    )
  }
})

const { data: detalles = [], isLoading } = useQuery({
  queryKey: ['pedido', idPedido],
  queryFn: () => getPedidoDetalle(idPedido),
  enabled: !!idPedido
})

const { data: cuentaData } = useQuery({
  queryKey: ['cuentaActual', idPedido],
  queryFn: () => getCuentaActual(idPedido),
  enabled: !!idPedido
})

const cuentaActual = cuentaData?.cuenta_actual ?? 1


const detallesCuenta = detalles.filter(d =>
  d.estado === 'pendiente' &&
  seleccionados.includes(d.id_detalle)
)


const totalCuenta = detallesCuenta.reduce(
  (acc, d) => acc + d.precio,
  0
)


const { data: pedidos = [] } = useQuery({
  queryKey: ['pedidos'],
  queryFn: getPedidos
})


// Detalles seleccionados para pagar

const detallesSeleccionados = detalles.filter(d =>
  d.estado === 'pendiente' &&
  seleccionados.includes(d.id_detalle)
)


// Resumen de la cuenta

const resumenCuenta = Object.values(
  detallesSeleccionados.reduce((acc, item) => {
    const key = `${item.nombre}-${item.precio}`

    if (!acc[key]) {
      acc[key] = {
        nombre: item.nombre,
        cantidad: 1,
        precioTotal: item.precio
      }
    } else {
      acc[key].cantidad += 1
      acc[key].precioTotal += item.precio
    }

    return acc
  }, {})
)


/**
 * ---------checkbox logic---------
*/

// obtener los id visibles

const idsVisibles = detalles
  .filter(d => d.estado === 'pendiente')
  .map(d => d.id_detalle)


// estados del checkbox maestro

const todosSeleccionados =
  idsVisibles.length > 0 &&
  idsVisibles.every(id => seleccionados.includes(id))

// función toggle masivo

const toggleTodos = () => {
  if (todosSeleccionados) {
    // desmarcar todos
    setSeleccionados(prev =>
      prev.filter(id => !idsVisibles.includes(id))
    )
  } else {
    // marcar todos
    setSeleccionados(prev =>
      Array.from(new Set([...prev, ...idsVisibles]))
    )
  }
}

/* ----------- Modal Pagos-----------*/

// Agregar Pago compuesto

const agregarPago = () => {
  setPagos([...pagos, { metodo: 'efectivo', monto: '' }])
}


return (
    <div className="w-full shadow-md">
      {mensajeOk && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success">
            <span>{mensajeOk}</span>
          </div>
        </div>
      )}

      <HeaderNav />

      <div className="flex flex-col md:flex-row w-full">
        <div className="drawer lg:drawer-open w-full">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

          {/* CONTENIDO PRINCIPAL */}
          <div className="drawer-content p-4 w-full">

            <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden mb-4">
              ☰
            </label>
            <h1 className="text-2xl font-bold mb-4">Detalles del Pedido</h1>

          {/* PRODUCTOS A PAGAR */}
          <div className="p-4 flex flex-col xl:flex-row gap-3">
            {/*TABLA LISTA DE PRODUCTOS A ELEGIR */}
            <div className="flex flex-col bg-white p-4 rounded-lg shadow-md">
                {/* Botones de accion */}
                <div className='flex flex-row justify-between'>
                   <div>
                    <button className="btn btn-sm btn-outline btn-secondary mr-2 mb-2">Voucher</button>
                    <button className="btn btn-sm btn-outline btn-secondary mr-2 mb-2">Cocina</button>
                   </div>
                   <button className="btn btn-sm btn-primary mr-2 mb-2">+<span className="hidden md:inline">Agregar Producto</span></button>
                </div>
                {/* Tabla de productos individuales para escoger*/ }
                <div className="flex flex-col overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>
                              <input
                                type="checkbox"
                                className="checkbox"
                                checked={todosSeleccionados}
                                onChange={toggleTodos}
                              />
                            </th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Observacion</th>
                            <th>acción</th>
                        </tr>
                    </thead>
                        <tbody>
                        {detalles
                            .filter(d => d.estado === 'pendiente')
                            .map(d => (
                            <tr key={d.id_detalle}>
                                <td>
                                <input
                                    type="checkbox"
                                    checked={seleccionados.includes(d.id_detalle)}
                                    onChange={() => toggleDetalle(d.id_detalle)}
                                    className="checkbox"
                                />
                                </td>
                                <td>{d.nombre}</td>
                                <td>{d.precio.toFixed(2)}</td>
                                <td>{d.observacion}</td>
                                <td>
                                <button className="btn btn-xs">Editar</button>
                                <button className="btn btn-xs btn-error">Borrar</button>
                                </td>
                            </tr>
                            ))}
                        </tbody>

                </table>
                </div>
            </div>
            {/* Total a pagar */}
            <div className="divider divider-horizontal"></div>
            <div className='bg-white p-4 rounded-lg shadow-md'>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">
                    Cuenta {cuentaActual}
                  </p>
                  <span className="badge badge-primary badge-outline">
                    actual
                  </span>
                </div>

              <div className="divider"></div>
              {/**Tabla resumen a pagar por cuenta */}
              <div className="flex flex-col overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Nombre</th>
                            <th>Precio Total</th>
                        </tr>
                    </thead>
                    <tbody>
                      {resumenCuenta.map((item, i) => (
                        <tr key={i}>
                          <td>{item.cantidad}</td>
                          <td>{item.nombre}</td>
                          <td>{item.precioTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>

                </table>
                </div>
                <div className="flex justify-end mt-4 p-4 border-t">
                    <span className="font-bold text-lg">Total: S/ </span>
                    <span className="font-bold text-lg">
                      {totalCuenta.toFixed(2)}
                    </span>

                </div>
                <div className="flex justify-between p-4">
                    <button className='btn btn-primary btn-sm'>Imprimir</button>
                    <button
                      className="btn btn-success btn-sm"
                      disabled={seleccionados.length === 0}
                      onClick={() => setMostrarModalPago(true)}
                    >
                      Pagar
                    </button>


                </div>
            </div>
          </div>
          </div>
          {/* SIDEBAR */}
          <div className="drawer-side">
            <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
                <ul className="menu bg-base-200 min-h-full w-80 p-4">
                <p className="text-xl font-bold">Pedidos</p>
                <div className="divider"></div>

                {pedidos.map(p => (
                    <li key={p.id_pedido}>
                    <Link
                        to={`/orden/${p.id_pedido}`}
                        className={`flex justify-between mb-2 ${
                        Number(idPedido) === p.id_pedido
                            ? 'bg-secondary text-secondary-content'
                            : 'bg-white text-black'
                        }`}
                    >
                        <span className="font-bold">#{p.id_pedido}</span>
                        <span>{p.mesa}</span>
                    </Link>
                    </li>
                ))}
                </ul>

          </div>

        </div>
      </div>

      {/* Modal de Pago */}

      {mostrarModalPago && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            {/* HEADER */}
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>CUENTA {cuentaActual}</span>
              <span className="badge badge-success badge-outline">
                en curso
              </span>
              <span className="opacity-70">
                – Mesa {pedidos.find(p => p.id_pedido == idPedido)?.mesa}
              </span>
            </h3>


            <div className="divider"></div>

            {/* TOTAL */}
            <p className="text-lg font-semibold">
              Total a pagar: S/ {totalCuenta.toFixed(2)}
            </p>

            {/* PAGOS */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Pagos</span>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() =>
                    setPagos([...pagos, { metodo: 'efectivo', monto: '' }])
                  }
                >
                  + Agregar pago
                </button>
              </div>

              {pagos.map((pago, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                  <select
                    className="select select-bordered w-1/2"
                    value={pago.metodo}
                    onChange={e => {
                      const copia = [...pagos]
                      copia[index].metodo = e.target.value
                      setPagos(copia)
                    }}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="agora">Agora</option>
                    <option value="transferencia">Transferencia</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-1/2"
                    placeholder="Monto"
                    value={pago.monto}
                    onChange={e => {
                      let valor = e.target.value
                      valor = valor === '' ? '' : Math.max(0, parseFloat(valor))

                      const copia = [...pagos]
                      copia[index].monto = valor
                      setPagos(copia)
                    }}
                  />

                  <button
                    className="btn btn-xs btn-error"
                    disabled={pagos.length === 1}
                    onClick={() => {
                      if (pagos.length === 1) return
                      setPagos(pagos.filter((_, i) => i !== index))
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* CALCULOS */}
            {(() => {
              const totalPagado = pagos.reduce(
                (acc, p) => acc + (parseFloat(p.monto) || 0),
                0
              )

              const saldo = Math.max(totalCuenta - totalPagado, 0)
              const vuelto = Math.max(totalPagado - totalCuenta, 0)

              const pagoValido = totalPagado >= totalCuenta

              return (
                <>
                  <div className="divider"></div>

                  <div className="flex justify-between">
                    <span>Saldo a pagar:</span>
                    <span className="font-semibold">S/ {saldo.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Vuelto:</span>
                    <span className="font-semibold">S/ {vuelto.toFixed(2)}</span>
                  </div>

                  {/* BOTONES */}
                  <div className="modal-action">
                    <button
                      className="btn"
                      onClick={() => {
                        setMostrarModalPago(false)
                        setPagos([{ metodo: 'efectivo', monto: '' }])
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn btn-success"
                      disabled={!pagoValido || pagarMutation.isLoading}
                      onClick={() => {
                        pagarMutation.mutate({
                          idPedido,
                          payload: {
                            detalles: seleccionados,
                            pagos: pagos.map(p => ({
                              metodo: p.metodo,
                              monto: parseFloat(p.monto)
                            })),
                            vuelto
                          }
                        })
                      }}
                    >
                      {pagarMutation.isLoading ? 'Procesando...' : 'Confirmar Pago'}
                    </button>

                  </div>
                </>
              )
            })()}
          </div>
        </dialog>
      )}


      {/*Fin Modal de Pago */}

    </div>
  );
}

export default OrdenPage