import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeaderNav from '../components/header_nav.jsx'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pagarCuenta, getPedidoDetalle } from '../api'
import { useParams } from 'react-router-dom'
import { getPedidos } from '../api'




function OrdenPage() {

const [cuentaActual, setCuentaActual] = useState(1)
const [seleccionados, setSeleccionados] = useState([])
const { idPedido } = useParams()
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
  onSuccess: () => {
    setSeleccionados([])
    setCuentaActual(c => c + 1)
    queryClient.invalidateQueries(['pedido', idPedido])
  }
})

const { data: detalles = [], isLoading } = useQuery({
  queryKey: ['pedido', idPedido],
  queryFn: () => getPedidoDetalle(idPedido),
  enabled: !!idPedido
})

const detallesCuenta = detalles.filter(d =>
  d.cuenta === cuentaActual &&
  seleccionados.includes(d.id_detalle)
)
// Estado de modal de pago

const [pagos, setPagos] = useState([
  { metodo: 'efectivo', monto: '' }
])

// Agregar metodo de pago   

const agregarPago = () => {
  setPagos([...pagos, { metodo: '', monto: '' }])
}

const { data: pedidos = [] } = useQuery({
  queryKey: ['pedidos'],
  queryFn: getPedidos
})


return (
    <div className="w-full shadow-md">
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
                            <th><input type="checkbox" defaultChecked className="checkbox" /></th>
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
                <p className="text-xl">Cuenta {cuentaActual}</p>
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
                        <tr>
                            <td>2</td>
                            <td>Latte matcha frio (12 Oz)</td>
                            <td>19.00</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Americano Frio (12 Oz)</td>
                            <td>5.50</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Cafe moka frio (12 Oz)</td>
                            <td>10.50</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <div className="flex justify-end mt-4 p-4 border-t">
                    <span className="font-bold text-lg">Total: S/ </span>
                    <span className="font-bold text-lg">35.00</span>
                </div>
                <div className="flex justify-between p-4">
                    <button className='btn btn-primary btn-sm'>Imprimir</button>
                    <button
                        className='btn btn-success btn-sm'
                        onClick={() => {
                            pagarMutation.mutate({
                            idPedido,
                            cuenta: cuentaActual,
                            detalles: seleccionados,
                            pagos
                            })
                        }}
                        disabled={seleccionados.length === 0}
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
    </div>
  );
}

export default OrdenPage