import HeaderNav from '../components/header_nav.jsx'
import { useState } from 'react';

function PagosPage() {
  // Estado para controlar qué acordeones están expandidos
  const [expanded, setExpanded] = useState({});

  // Ejemplo de datos estáticos (simulando pedidos)
  const items = [
    { id: 1, titulo: "Pedido #1 - Mesa 3" },
    { id: 2, titulo: "Pedido #2 - Mesa 7" },
    { id: 3, titulo: "Pedido #3 - Mesa 5" },
    { id: 4, titulo: "Pedido #4 - Mesa 7" }
  ];
  
    return (
    <div className="flex flex-col justify-center items-center">
        <HeaderNav />
        <div className="pt-10 px-5 flex flex-col md:gap-5 bg-black justify-center">
          {items.map((item) => (
            <div
            key={item.id}
            className="border border-base-300 rounded-lg mb-3 overflow-hidden max-w-4xl md:min-w-xl"
            >
            {/* Título del acordeón */}
            <div
                className="font-semibold px-4 py-3 bg-base-100 cursor-pointer hover:bg-base-200 transition"
                onClick={() =>
                setExpanded((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                }))
                }
            >
                {item.titulo}
            </div>

            {/* Contenido desplegable */}
            {expanded[item.id] && (
                <div className="p-4 bg-white border-t border-base-200 flex flex-col gap-4">
                    {/* Contenido desplegable - IZQUIERDO */}
                    <div>
                        <div className="divider divider-start">Lista de Productos</div>
                        <div className="overflow-x-auto">
                        <table className="table">
                            {/* head */}
                            <thead>
                            <tr>
                                <th><input type="checkbox" defaultChecked className="checkbox checkbox-neutral" /></th>
                                <th>#</th>
                                <th>Descripción</th>
                                <th>Importe</th>
                            </tr>
                            </thead>
                            <tbody>
                            {/* row 1 */}
                            <tr>
                                <th><input type="checkbox" defaultChecked className="checkbox checkbox-warning" /></th>
                                <th>1</th>
                                <td>Americano Frio</td>
                                <td>5.50</td>
                            </tr>
                            {/* row 2 */}
                            <tr>
                                <th><input type="checkbox" defaultChecked className="checkbox checkbox-warning" /></th>
                                <th>1</th>
                                <td>waffle de fresa</td>
                                <td>10.00</td>
                            </tr>
                            {/* row 3 */}
                            <tr>
                                <th><input type="checkbox" defaultChecked className="checkbox checkbox-warning" /></th>
                                <th>2</th>
                                <td>Durazno</td>
                                <td>4.00</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="divider divider-start">Sub-total</div>
                        <div className='flex justify-end pr-5'>
                            <h2 className="text-lg font-bold">Total: $19.50</h2>
                        </div>
                        </div>
                    </div>
                    {/* Contenido desplegable - DERECHO */}
                    <div className='bg-gray-200 p-2 rounded-b-xl md:rounded-none md:rounded-r-xl'>
                        <p>Puedes agregar cualquier contenido aquí: formularios, resúmenes, tablas, etc.</p>
                    </div>
                </div>
            )}
            </div>
         ))}
        </div>
    </div>
  )
}

export default PagosPage





