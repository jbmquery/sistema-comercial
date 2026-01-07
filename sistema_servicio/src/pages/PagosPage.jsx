// PagosPage.jsx
import { useState, useEffect } from 'react';
import HeaderNav from "../components/header_nav";
import ModalBuscarCliente from '../components/ModalBuscarCliente';
import { API_BASE } from '../config';
import jsPDF from 'jspdf';

function PagosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [canBuscarCliente, setCanBuscarCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Cargar pedidos entregados
    const fetchPedidos = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/pedidos/entregados`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        setPedidos(data.pedidos || []);
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
    };

    useEffect(() => {
    fetchPedidos();
    }, []);

  // Cargar detalle del pedido seleccionado
  const handleSelectPedido = async (pedido) => {
    setSelectedPedido(pedido);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedido.id_pedido}/detalle-con-puntos`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      const detalle = data.detalle || [];

      setDetalle(detalle);

      // Calcular subtotal
      const total = detalle.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
      setSubtotal(total);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      setDetalle([]);
      setSubtotal(0);
    }
  };

  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowModal(false);
  };

  const handleClearCliente = () => {
    setClienteSeleccionado(null);
  };

  // Limpiar cliente si se desmarca el checkbox
  useEffect(() => {
    if (!canBuscarCliente) {
      setClienteSeleccionado(null);
    }
  }, [canBuscarCliente]);

  //DESCUENTOS 

    // Estados
    const [canApplyDiscounts, setCanApplyDiscounts] = useState(false);
    const [descuentos, setDescuentos] = useState([]); // [{ cliente, id_detalle }]
    const [descuentoSeleccionado, setDescuentoSeleccionado] = useState(null);
    const [showModalDescuento, setShowModalDescuento] = useState(false);

    // Función para agregar nuevo descuento
    const agregarNuevoDescuento = () => {
    setDescuentos([...descuentos, {}]);
    };

    // Función para seleccionar producto
    const handleSeleccionarProducto = (index, id_detalle) => {
    const nuevosDescuentos = [...descuentos];
    nuevosDescuentos[index] = { ...nuevosDescuentos[index], id_detalle: parseInt(id_detalle,10) };
    setDescuentos(nuevosDescuentos);
    };

    // Obtener productos que pueden ser canjeados (no repetidos, y que el cliente tenga puntos)
    
    const getProductosCanjeables = (currentIndex) => {
    if (!selectedPedido) return [];

    const descuentoActual = descuentos[currentIndex];
    if (!descuentoActual?.cliente) return [];

    const id_cliente_actual = descuentoActual.cliente.id_cliente;
    const puntos_totales_cliente = descuentoActual.cliente.puntos_acumulados;

    // 🔢 Calcular cuántos puntos YA HA USADO este cliente (en otros descuentos)
    const puntos_usados_por_este_cliente = descuentos
        .filter((d, i) => 
        i !== currentIndex && 
        d.cliente?.id_cliente === id_cliente_actual && 
        d.id_detalle
        )
        .reduce((total, d) => {
        const item = detalle.find(det => det.id_detalle === d.id_detalle);
        return total + (item?.puntos_canje * item?.cantidad || 0); // ✅ Multiplicado por cantidad
        }, 0);

    const puntos_disponibles = puntos_totales_cliente - puntos_usados_por_este_cliente;

    return detalle.filter(item => {
        // 1. Validar puntos_canje
        if (!item.puntos_canje || item.puntos_canje <= 0) return false;

        // 2. Calcular costo total del producto (por toda su cantidad)
        const costoTotal = item.cantidad * item.puntos_canje;

        // 3. Verificar que el cliente tenga suficientes puntos
        if (costoTotal > puntos_disponibles) return false;

        // 4. Verificar que NO haya sido canjeado completamente
        const veces_canjeado = descuentos.filter(d => d.id_detalle === item.id_detalle).length;
        return veces_canjeado === 0; // ✅ Solo aparece si no ha sido canjeado ni una vez
    });
    };

    // ELIMINAR DESCUENTO

    const eliminarDescuento = (index) => {
    const nuevosDescuentos = [...descuentos];
    //const descuentoEliminado = nuevosDescuentos[index];

    // Solo eliminamos el descuento, los puntos se recalculan en getProductosCanjeables
    nuevosDescuentos.splice(index, 1);
    setDescuentos(nuevosDescuentos);
    };

    // MODAL CONFIRMAR PAGOS

    const [showModalPago, setShowModalPago] = useState(false);
    const [formaPago, setFormaPago] = useState('');
    const [montoPagado, setMontoPagado] = useState('');
    const [montoVuelto, setMontoVuelto] = useState(0);

    const calcularTotales = () => {
    const subtotal = detalle.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    
    const puntosCanjeadosTotal = descuentos.reduce((total, desc) => {
    const item = detalle.find(d => d.id_detalle === desc.id_detalle);
    return total + (item?.puntos_canje * item?.cantidad || 0); // ✅ Por cantidad
    }, 0);

    const descuentoSoles = descuentos.reduce((total, desc) => {
    const item = detalle.find(d => d.id_detalle === desc.id_detalle);
    return total + (item?.precio_unitario * item?.cantidad || 0); // ✅ Por cantidad
    }, 0);

    const totalAPagar = subtotal - descuentoSoles;

    return { subtotal, descuentoSoles, puntosCanjeadosTotal, totalAPagar };
    };

    // CONTROLADOR DEL MODAL DE RESUMEN DE PAGO

    const [pagoRealizado, setPagoRealizado] = useState(false);

    // FUNCION COMPARTIR POR WHATSAPP

    const compartirPorWhatsApp = () => {
      // ✅ Validar que el cliente seleccionado tenga celular
      if (!clienteSeleccionado?.celular) {
        alert("Cliente no registrado o sin número de celular");
        return;
      }

      const cliente = clienteSeleccionado;
      const { subtotal, descuentoSoles, totalAPagar } = calcularTotales();

      // ✅ Fecha y hora actual (emisión del voucher)
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const hora = ahora.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // ✅ Agrupar productos por abreviado (sin repetir)
      const productosAgrupados = detalle.reduce((acc, item) => {
        const key = item.abreviado;
        if (!acc[key]) {
          acc[key] = { ...item, cantidad: 0 };
        }
        acc[key].cantidad += item.cantidad;
        return acc;
      }, {});

      // ✅ Generar lista de productos (alineada)
      let detalleTexto = "";
      Object.values(productosAgrupados).forEach(item => {
        const total = (item.precio_unitario * item.cantidad).toFixed(2);
        detalleTexto += `${item.cantidad} - ${item.abreviado}${item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""} - S/ ${total}\n`;
      });

      // ✅ Generar lista de descuentos (solo si hay descuentos)
      let descuentosTexto = "";
      let tieneDescuentos = descuentos.length > 0;

      descuentos.forEach(descuento => {
        const item = detalle.find(d => d.id_detalle === descuento.id_detalle);
        if (item) {
          const total = (item.precio_unitario * item.cantidad).toFixed(2);
          descuentosTexto += `${item.cantidad} - ${item.abreviado}${item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""} - S/ ${total}\n`;
        }
      });

      // ✅ Construir mensaje con formato limpio
      let mensaje = `
------------------------------------

*Pluvia Café*  -  _Café, amor y barrio_

------------------------------------
!Gracias por tu visita!
N° de pedido: ${selectedPedido.numero_orden}
F: ${fecha} - H: ${hora}
------------- Detalle --------------
${detalleTexto.trim()}
`;

// ✅ Añadir sección "Descuentos" solo si hay descuentos
if (tieneDescuentos) {
mensaje += `---------- Descuentos ------------
${descuentosTexto.trim()}
`;
      }

      // ✅ Añadir totales (siempre visible)
mensaje += `----------- Sub-Total -------------
*Total:* S/ ${subtotal.toFixed(2)}
*Descuento:* S/ ${descuentoSoles.toFixed(2)}
*Total a pagar:* S/ ${totalAPagar.toFixed(2)}

_¡Esperamos verte pronto!_
`

if (tieneDescuentos) {
mensaje += `------------------------------------
Recuerda, que puedes consultar a
través de WhatsApp o de manera
presencial. Cuantos puntos tienes
acumulados.
------------------------------------`
}

mensaje +=``.trim();

// ✅ Codificar mensaje para URL
const mensajeCodificado = encodeURIComponent(mensaje);
const numero = cliente.celular.replace(/\D/g, ''); // Solo números
const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;

      // ✅ Abrir WhatsApp
window.open(url, '_blank');
};

// FUNCION IMPRIMIR VOUCHER O GENERAR PDF

const imprimirVoucherPDF = () => {
  const { subtotal, descuentoSoles, totalAPagar } = calcularTotales();

  // Configuración del PDF: tamaño A7 (≈ 57mm ancho)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [57, 210] // Ancho: 57mm, alto: variable
  });

  const margin = 2; // Margen pequeño para aprovechar el ancho
  const pageWidth = 57;
  let y = 10;

  // --- LOGO (opcional) ---
  const logo = new Image();
  logo.src = '/img/logo_pluvia_completo.png'; // Asegúrate de que exista

  logo.onload = () => {
    const logoWidth = 20;
    const logoHeight = 20;
    doc.addImage(logo, 'PNG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
    y += logoHeight + 2;
  };

  // --- TÍTULO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Pluvia Café', margin, y, { maxWidth: pageWidth - 2 * margin });
  y += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Café, amor y barrio', margin, y);
  y += 6;

  // --- DATOS DEL PEDIDO ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`N° de pedido: ${selectedPedido.numero_orden}`, margin, y);
  y += 5;

  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-PE');
  const hora = ahora.toLocaleTimeString('es-PE');
  doc.text(`F: ${fecha} - H: ${hora}`, margin, y);
  y += 8;

  // --- LÍNEA SEPARADORA ---
  doc.setDrawColor(0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- DETALLE DEL PEDIDO ---
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle del Pedido', margin, y);
  y += 5;

  // Agrupar productos por abreviado
  const productosAgrupados = Object.values(detalle.reduce((acc, item) => {
    const key = item.abreviado;
    acc[key] = acc[key] || { ...item, cantidad: 0 };
    acc[key].cantidad += item.cantidad;
    return acc;
  }, {}));

  // Tabla de productos
  productosAgrupados.forEach(item => {
    const nombre = `${item.abreviado}${item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""}`;
    const importe = `S/ ${(item.precio_unitario * item.cantidad).toFixed(2)}`;
    const linea = `${item.cantidad} x ${nombre} - ${importe}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(linea, margin, y);
    y += 4;
  });

  y += 2;

  // --- DESCUENTOS (si hay) ---
  if (descuentos.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Descuentos', margin, y);
    y += 5;

    descuentos.forEach(descuento => {
      const item = detalle.find(d => d.id_detalle === descuento.id_detalle);
      if (!item) return;
      const nombre = `${item.abreviado}${item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""}`;
      const importe = `S/ ${(item.precio_unitario * item.cantidad).toFixed(2)}`;
      const linea = `${item.cantidad} x ${nombre} - ${importe}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(linea, margin, y);
      y += 4;
    });

    y += 2;
  }

  // --- LÍNEA SEPARADORA ---
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // --- TOTALES ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Sub-Total', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.text(`Total: S/ ${subtotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.text(`Descuento: S/ ${descuentoSoles.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total a pagar: S/ ${totalAPagar.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 8;

  // --- LÍNEA SEPARADORA ---
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- MENSAJE FINAL ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('¡Esperamos verte pronto!', margin, y,);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.text('Recuerda, que puedes consultar a', margin, y);
  y += 4;
  doc.text('través de WhatsApp o presencial.', margin, y);
  y += 6;

  // --- QR CODE ---
  import('qrcode').then(qrModule => {
    const qr = qrModule.default;
    const whatsappUrl = 'https://wa.me/51956228708';

    qr.toDataURL(whatsappUrl, { errorCorrectionLevel: 'M' }, (err, url) => {
      if (err) throw err;

      const qrSize = 25;
      const qrX = (pageWidth - qrSize) / 2;
      doc.addImage(url, 'PNG', qrX, y, qrSize, qrSize);
      y += qrSize + 2;

      // --- TEXTO DEL QR ---
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text('Escanea para contactarnos', margin, y,);
      y += 5;

       // --- CONTACTO SOFTWARE ---

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5);
      doc.text('Si desea información acerca del software, puede solicitarle el', margin, y);
      y += 3;
      doc.text('número de contacto a la sueña del establecimiento', margin, y);
      y += 3;

      // Guardar PDF
      doc.save(`voucher-pedido-${selectedPedido.numero_orden}.pdf`);
    });
  });
};

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />

      <div className='flex flex-col md:flex-row w-full max-w-7xl px-4 gap-4 mt-6'>
        
        {/* IZQUIERDA - Lista de pedidos */}
        <div className='bg-secondary-content p-4 rounded-lg md:w-80 flex-shrink-0'>
          <h3 className="font-bold mb-4">Lista de Pedidos</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pedidos.length === 0 ? (
              <p className="text-gray-500">No hay pedidos entregados</p>
            ) : (
              pedidos.map((pedido) => (
                <div
                  key={pedido.id_pedido}
                  onClick={() => handleSelectPedido(pedido)}
                  className={`p-2 rounded shadow cursor-pointer ${
                    selectedPedido?.id_pedido === pedido.id_pedido ? 'bg-blue-100' : 'bg-white'
                  }`}
                >
                  <p><strong>Pedido #{pedido.numero_orden} | </strong>{pedido.nombre_mesa}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DERECHA - Detalle del pedido */}
        <div className='bg-gray-200 p-6 rounded-lg flex-grow'>
          <h2 className="font-bold mb-6">Detalle del Pedido</h2>

          <div className='flex flex-col md:flex-row gap-6'>
            
            {/* TABLA PRODUCTOS */}
            <div className="flex-grow">
              {selectedPedido ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Cant.</th>
                          <th>Descripción</th>
                          <th>Importe</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalle.map((item) => (
                          <tr key={item.id_detalle}>
                            <th>{item.cantidad}</th>
                            <td>{item.nombre_producto} {item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""}</td>
                            <td>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                            <td>
                              {item.cantidad > 1 && (
                                <button
                                    className="btn btn-warning btn-xs"
                                    onClick={async () => {
                                        if (!selectedPedido) return;

                                        const confirmado = window.confirm(`¿Dividir ${item.nombre_producto}?`);
                                        if (!confirmado) return;

                                        try {
                                        const response = await fetch(`${API_BASE}/api/detalle_pedido/dividir`, {
                                            method: 'POST',
                                            headers: {
                                            'Content-Type': 'application/json',
                                            'ngrok-skip-browser-warning': 'true'
                                            },
                                            body: JSON.stringify({ id_detalle: item.id_detalle })
                                        });

                                        const result = await response.json();

                                        if (response.ok) {
                                            // Refrescar el detalle del pedido
                                            const res = await fetch(`${API_BASE}/api/pedidos/${selectedPedido.id_pedido}/detalle-con-puntos`, {
                                            headers: { 'ngrok-skip-browser-warning': 'true' }
                                            });
                                            const data = await res.json();
                                            setDetalle(data.detalle || []);
                                            // Recalcular subtotal
                                            const total = data.detalle.reduce((sum, i) => sum + (i.precio_unitario * i.cantidad), 0);
                                            setSubtotal(total);
                                        } else {
                                            alert("Error: " + result.message);
                                        }
                                        } catch (error) {
                                        console.error("Error al dividir producto:", error);
                                        alert("Error de conexión");
                                        }
                                    }}
                                    >
                                    dividir
                                    </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className='divider divider-start'>Sub-total</div>
                  <div className='flex justify-between items-center'>
                  {/* Botones Imprimir detalle de pedido*/}
                    <div className="flex justify-center m-0">
                          <button
                            onClick={imprimirVoucherPDF}
                            className="btn btn-md btn-outline"
                          >
                          <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 21h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2Zm0 0h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-1.414.586" />
                              <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
                              <path d="M17 5v4H7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2Z" />
                          </svg>
                          <span className='hidden md:inline'>Imprimir</span>
                          </button>
                    </div>
                    <div className='text-right font-bold text-lg'>S/ {subtotal.toFixed(2)}</div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Selecciona un pedido para ver su detalle</p>
              )}
            </div>
            {/* Buscar cliente */}
            <div className="md:w-80 flex-shrink-0">
              <div className="form-control mb-6">
                <div className="divider divider-start font-semibold mb-4">Cliente acumula Puntos</div>
                <label className="label cursor-pointer">
                  <span className="label-text font-medium mb-4">Habilitar</span>
                  <input
                    type="checkbox"
                    checked={canBuscarCliente}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCanBuscarCliente(checked);
                      if (!checked) {
                        setClienteSeleccionado(null); // ✅ Limpiar cliente
                      }
                    }}
                    className="toggle mb-4"
                  />
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="DNI del cliente"
                    className="input input-bordered w-full"
                    value={clienteSeleccionado?.dni || ''}
                    readOnly
                  />
                  <button
                    onClick={() => canBuscarCliente && setShowModal(true)}
                    disabled={!canBuscarCliente}
                    className="btn btn-primary"
                  >
                    <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="m21 21-6-6m2-5a7.001 7.001 0 0 1-11.95 4.95A7 7 0 1 1 17 10Z" />
                    </svg>
                    <span className="hidden md:inline">Buscar</span>
                  </button>
                  {clienteSeleccionado && (
                    <button
                      onClick={handleClearCliente}
                      className="btn btn-secondary"
                    >
                      <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 11v6m4-6v6M4 7h16m-1 0-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7h14Zm-4 0V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3h6Z" />
                      </svg>
                      <span className="hidden md:inline">Limpiar</span>
                    </button>
                  )}
                </div>
              </div>

              {clienteSeleccionado && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                  <div className='mb-4'>
                    <span className="font-semibold">Cliente Seleccionado</span>
                  </div>
                  <p className='text-sm'><strong>ID:</strong> {clienteSeleccionado.id_cliente}</p>
                  <p className='text-sm'><strong>Nombre:</strong> {clienteSeleccionado.nombre_completo}</p>
                  <p className='text-sm'><strong>DNI:</strong> {clienteSeleccionado.dni}</p>
                  <p className='text-sm'><strong>Puntos:</strong> {clienteSeleccionado.puntos_acumulados}</p>
                </div>
              )}
                {/* TIPOS DE PAGO */}

                <div className="divider divider-start font-semibold mb-4">Método de Pago</div>
                <select className="select select-bordered select-md w-full"
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}               
                >
                    <option value="">Seleccionar método de pago</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="transferencia">Transferencia</option>
                </select>

                {/* DESCUENTOS POR PUNTOS */}
                <div className="mt-6">
                <div className="divider divider-start font-semibold mb-4">Descuentos (puntos)</div>
                <label className="label cursor-pointer mb-4">
                    <span className="label-text font-medium">Habilitar</span>
                    <input
                    type="checkbox"
                    checked={canApplyDiscounts}
                    onChange={(e) => {
                        setCanApplyDiscounts(e.target.checked);
                        if (!e.target.checked) {
                        setDescuentos([]); // Limpiar descuentos si se deshabilita
                        }
                    }}
                    className="toggle"
                    />
                </label>

                {canApplyDiscounts && (
                    <div className="space-y-4">
                    {descuentos.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay descuentos agregados</p>
                    ) : (
                        descuentos.map((descuento, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="DNI"
                                value={descuento.cliente?.dni || ''}
                                readOnly
                                className="input input-bordered input-sm w-36"
                            />
                            <button
                                onClick={() => {
                                setDescuentoSeleccionado({ index });
                                setShowModalDescuento(true);
                                }}
                                className="btn btn-sm btn-outline"
                            >
                            <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m21 21-6-6m2-5a7.001 7.001 0 0 1-11.95 4.95A7 7 0 1 1 17 10Z" />
                            </svg>
                            <span className="hidden md:inline">Buscar</span>
                            </button>
                            <button
                                onClick={() => eliminarDescuento(index)}
                                className="btn btn-sm btn-neutral"
                                >
                                <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 11v6m4-6v6M4 7h16m-1 0-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7h14Zm-4 0V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3h6Z" />
                                </svg>
                            </button>
                                                        </div>
                            {descuento.cliente && (
                            <>
                                <p className="text-sm"><strong>Cliente:</strong> {descuento.cliente.nombre_completo}</p>
                                <p className="text-sm"><strong>Puntos disponibles:</strong> {descuento.cliente.puntos_acumulados}</p>
                            </>
                            )}
                            {descuento.cliente && (
                            <div className="mt-2">
                                <label className="label">
                                <span className="label-text mb-2">Producto a canjear</span>
                                </label>
                                <select
                                value={descuento.id_detalle || ''}
                                onChange={(e) => handleSeleccionarProducto(index, e.target.value)}
                                className="select select-bordered select-sm w-full"
                                >
                                <option value="">Seleccionar producto</option>
                                {getProductosCanjeables(index).map((item) => (
                                    <option
                                    key={item.id_detalle}
                                    value={item.id_detalle}
                                    >
                                    {item.cantidad} - {item.nombre_producto} {item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""} (Costo: {item.puntos_canje * item.cantidad} puntos)
                                    </option>
                                ))}
                                </select>

                                {/* ✅ Muestra el producto seleccionado aunque ya no esté en la lista */}
                                {descuento.id_detalle && !getProductosCanjeables(index).some(item => item.id_detalle === descuento.id_detalle) && (
                                <div className="text-xs text-black mt-1 text-center mt-3 font-bold">
                                    {(() => {
                                    const item = detalle.find(d => d.id_detalle === descuento.id_detalle);
                                    return item
                                        ? `${item.cantidad} - ${item.nombre_producto}${item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""} (Costo: ${item.puntos_canje * item.cantidad} puntos)`
                                        : "Producto no disponible";
                                    })()}
                                </div>
                                )}
                            </div>
                            )}
                        </div>
                        ))
                    )}

                    <button
                        onClick={agregarNuevoDescuento}
                        disabled={!canApplyDiscounts}
                        className="btn btn-sm btn-primary"
                    >
                        + Añadir descuento
                    </button>
                    </div>
                )}
                </div>
                <div className='divider'></div>
                <div className="flex flex-row justify-between gap-4 mb-15">
                    <button className='btn btn-neutral'>Cancelar</button>
                    <button
                    className='btn btn-primary text-white'
                    onClick={() => {
                        if (!selectedPedido) {
                        alert("Selecciona un pedido");
                        return;
                        }
                        if (!formaPago) {
                        alert("Selecciona un método de pago");
                        return;
                        }
                        setShowModalPago(true);
                        setMontoPagado('');
                        setMontoVuelto(0);
                        setPagoRealizado(false); // Reiniciar estado al abrir
                    }}
                    >
                    Pagar
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <ModalBuscarCliente
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectCliente={handleSelectCliente}
      />

      {/* Modal para descuentos */}
        <ModalBuscarCliente
        isOpen={showModalDescuento}
        onClose={() => setShowModalDescuento(false)}
        onSelectCliente={(cliente) => {
            if (!descuentoSeleccionado) return; // ← Asegúrate de que esté definido
            const nuevosDescuentos = [...descuentos];
            nuevosDescuentos[descuentoSeleccionado.index] = { 
            ...nuevosDescuentos[descuentoSeleccionado.index], 
            cliente 
            };
            setDescuentos(nuevosDescuentos);
            setShowModalDescuento(false);
        }}
        />

            {/* MODAL DE RESUMEN DE PAGO */}
            {showModalPago && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Resumen de Pago - {selectedPedido?.nombre_mesa}</h3>
                </div>

                {/* Productos */}
                <div className="mb-4">
                    <div className="font-semibold mb-2">Productos</div>
                    <div className="overflow-x-auto">
                    <table className="table table-compact w-full">
                        <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Descripción</th>
                            <th>Importe</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(
                            detalle.reduce((acc, item) => {
                            const key = `${item.nombre_producto}${item.porcion ? `_${item.porcion}_${item.unidad_medida}` : ''}`;
                            acc[key] = acc[key] || { ...item, cantidad: 0 };
                            acc[key].cantidad += item.cantidad;
                            return acc;
                            }, {})
                        ).map(([, item]) => (
                            <tr key={item.nombre_producto}>
                            <td>{item.cantidad}</td>
                            <td>{item.nombre_producto} {item.porcion ? `(${item.porcion} ${item.unidad_medida})` : ""}</td>
                            <td>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Descuentos */}
                {descuentos.length > 0 && (
                    <div className="mb-4">
                    <div className="font-semibold mb-2">Descuentos (puntos)</div>
                    <div className="overflow-x-auto">
                        <table className="table table-compact w-full">
                        <thead>
                            <tr>
                            <th>Cant.</th>
                            <th>Descripción</th>
                            <th>P. utilizados</th>
                            <th>Descuento (S/.)</th>
                            <th>Descontados a</th>
                            </tr>
                        </thead>
                        <tbody>
                            {descuentos.map((descuento, index) => {
                            console.log("Descuento actual:", descuento);
                            console.log("Productos canjeables:", getProductosCanjeables(index));
                            const item = detalle.find(d => d.id_detalle === descuento.id_detalle);
                            if (!item) return null;
                            return (
                                <tr key={index}>
                                    <td>{item.cantidad}</td> {/* ✅ Cantidad real del detalle */}
                                    <td>{item.nombre_producto} {item.porcion ? `(${item.porcion} ${item.unidad_medida})` : ""}</td>
                                    <td>{item.puntos_canje * item.cantidad} puntos</td> {/* ✅ Total de puntos */}
                                    <td>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td> {/* ✅ Descuento total */}
                                    <td>{descuento.cliente?.dni}</td>
                                </tr>
                            );
                            })}
                        </tbody>
                        </table>
                    </div>
                    </div>
                )}

                {/* Totales */}
                <div className="mb-4 mt-10">
                    <div className="flex justify-end gap-5">
                        <span>Sub-total:</span>
                        <span>S/ {calcularTotales().subtotal.toFixed(2)}</span>
                    </div>
                        <div className="flex justify-end gap-5">
                            <span>Descuentos:</span>
                            <span>S/ {calcularTotales().descuentoSoles.toFixed(2)}</span>
                        </div>
                    <div className="flex justify-end gap-5 font-bold text-lg">
                        <span>Total a pagar:</span>
                        <span>S/ {calcularTotales().totalAPagar.toFixed(2)}</span>
                    </div>
                </div>

                {/* Monto pagado y vuelto */}
                <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                    
                    <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Monto pagado</span>
                    </label>
                    <input type="number" step="0.5" value={montoPagado} onChange={(e) => {
                        const valor = parseFloat(e.target.value) || 0;
                        setMontoPagado(valor);
                        const vuelto = valor - calcularTotales().totalAPagar;
                        setMontoVuelto(vuelto >= 0 ? vuelto : 0);
                        }}
                        className="input input-bordered"
                        disabled={formaPago !== 'efectivo'}
                        placeholder="Ingrese monto"
                    />
                    </div>

                    <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Vuelto</span>
                    </label>
                    <input type="number" value={montoVuelto.toFixed(2)} readOnly className="input input-bordered"/>
                    </div>
                    
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between items-center gap-3 mt-6">
                {/* Botones iniciales: solo visibles ANTES del pago */}
                {!pagoRealizado ? (
                    <>
                    <button
                        onClick={() => setShowModalPago(false)}
                        className="btn btn-md  btn-default"
                    >
                        <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="m11 16-4-4m0 0 4-4m-4 4h14m-5 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v1" />
                        </svg>
                        <span>Atras</span>
                    </button>

                    <button
                        onClick={async () => {
                        if (!window.confirm("¿Confirmar pago?")) return;

                        const { puntosCanjeadosTotal, totalAPagar } = calcularTotales();
                        const monto = formaPago === 'efectivo' ? parseFloat(montoPagado) : totalAPagar;
                        const vuelto = formaPago === 'efectivo' ? montoVuelto : 0;

                        // Validar descuentos
                        if (descuentos.some(d => d.cliente && !d.id_detalle)) {
                            alert("Completa todos los productos en los descuentos");
                            return;
                        }

                        const descuentosValidos = descuentos
                            .filter(d => d.cliente && d.id_detalle)
                            .map(d => ({
                            id_cliente: d.cliente.id_cliente,
                            id_detalle: d.id_detalle
                            }));

                        const datos = {
                            id_pedido: selectedPedido.id_pedido,
                            forma_pago: formaPago,
                            monto_pagado: monto,
                            monto_vuelto: vuelto,
                            puntos_canjeados_total: puntosCanjeadosTotal,
                            cliente_acumula_id: clienteSeleccionado?.id_cliente || null,
                            descuentos: descuentosValidos
                        };

                        try {
                            const response = await fetch(`${API_BASE}/api/pagos/registrar`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'ngrok-skip-browser-warning': 'true'
                            },
                            body: JSON.stringify(datos)
                            });

                            const result = await response.json();

                            if (response.ok) {
                            alert("✅ Pago registrado con éxito");
                            setPagoRealizado(true); // ✅ Marcar como pagado
                            } else {
                            alert("Error: " + result.message);
                            }
                        } catch (error) {
                            console.error("Error al registrar pago:", error);
                            alert("Error de conexión");
                        }
                        }}
                        className="btn btn-success text-white"
                    >
                        Confirmar Pago
                    </button>
                    </>
                ) : (
                    // Botones finales: solo visibles DESPUÉS del pago
                    <>
                    <button
                        onClick={() => {
                        // Limpia todo el estado
                        setSelectedPedido(null);
                        setDetalle([]);
                        setSubtotal(0);
                        setClienteSeleccionado(null);
                        setCanBuscarCliente(false);
                        setDescuentos([]);
                        setCanApplyDiscounts(false);
                        setFormaPago('');
                        fetchPedidos();
                        setShowModalPago(false);
                        setPagoRealizado(false);
                        }}
                        className="btn btn-neutral"
                    >
                        Cerrar
                    </button>

                    {/* Botones Imprimir y Compartir */}
                    <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={imprimirVoucherPDF}
                          className="btn btn-md btn-outline"
                        >
                        <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 21h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2Zm0 0h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-1.414.586" />
                            <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
                            <path d="M17 5v4H7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2Z" />
                        </svg>
                        <span className='hidden md:inline'>Imprimir</span>
                        </button>
                        <button
                          onClick={compartirPorWhatsApp}
                          className="btn btn-md btn-outline"
                          disabled={!clienteSeleccionado?.celular}
                          title={clienteSeleccionado?.celular ? "Enviar por WhatsApp" : "Cliente sin número"}
                        >
                        <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684 6.632 3.316m-6.632-6 6.632-3.316m0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Zm0-9.316a3.003 3.003 0 0 0 4.025 1.341 3 3 0 1 0-4.025-1.341Z" />
                        </svg>
                        <span className='hidden md:inline'>Compartir</span>
                        </button>
                    </div>
                    </>
                )}
                </div>
                                
                
                </div>
            </div>
            )}

    </div>
  );
}

export default PagosPage;