import React, { useState, useEffect, useRef } from 'react';
import HeaderCom from '../components/header_com.jsx';

function CartaPage() {
  const [messages, setMessages] = useState([
    {
      text: "¡Hola! 👋 Soy tu asistente IA. Puedes preguntarme sobre productos, precios, categorías, stock, etc.",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // ⚠️ EN PRODUCCIÓN, ESTO SE REEMPLAZA POR UNA LLAMADA A TU BACKEND
  // Por ahora, simulamos respuestas con lógica inteligente basada en la estructura de tu DB
  const queryDatabase = async (question) => {
    // Simulamos datos reales de tu base de datos (para que funcione sin backend)
    // Estos datos deberían venir de una consulta real a PostgreSQL cuando tengas backend
    const mockData = {
      carta: [
        { id_carta: 1, nombre: "Corte Clásico", precio: 25000, categoria: 1, sub_categoria: 1, disponible: true },
        { id_carta: 2, nombre: "Tinte Completo", precio: 45000, categoria: 1, sub_categoria: 2, disponible: true },
        { id_carta: 3, nombre: "Cerveza Artesanal", precio: 8000, categoria: 2, sub_categoria: 3, disponible: true },
        { id_carta: 4, nombre: "Hamburguesa Gourmet", precio: 32000, categoria: 3, sub_categoria: 4, disponible: true },
        { id_carta: 5, nombre: "Lomo Saltado", precio: 38000, categoria: 3, sub_categoria: 5, disponible: true },
      ],
      categorias: [
        { id_categoria: 1, nombre_cat: "Servicios" },
        { id_categoria: 2, nombre_cat: "Bebidas" },
        { id_categoria: 3, nombre_cat: "Comidas" },
      ],
      inventario: [
        { id_inventario: 1, nombre_producto: "Cerveza Artesanal", stock_actual: 150, unidad_stock: "unidades" },
        { id_inventario: 2, nombre_producto: "Carne de Res", stock_actual: 80, unidad_stock: "kg" },
        { id_inventario: 3, nombre_producto: "Tinte Rubio", stock_actual: 25, unidad_stock: "unidades" },
      ],
      mesas: [
        { id_mesas: 1, nombre: "Mesa 1", capacidad: 4, disponibilidad: true },
        { id_mesas: 2, nombre: "Mesa 2", capacidad: 6, disponibilidad: false },
      ]
    };

    const lowerQuestion = question.toLowerCase();

    // 1. Producto más caro
    if (lowerQuestion.includes("más caro") || lowerQuestion.includes("más costoso") || lowerQuestion.includes("precio más alto")) {
      const maxProduct = mockData.carta.reduce((max, p) => (p.precio > max.precio ? p : max));
      return `✅ El producto más caro es: **${maxProduct.nombre}** a $${maxProduct.precio}.`;
    }

    // 2. Producto más barato
    if (lowerQuestion.includes("más barato") || lowerQuestion.includes("precio más bajo")) {
      const minProduct = mockData.carta.reduce((min, p) => (p.precio < min.precio ? p : min));
      return `✅ El producto más barato es: **${minProduct.nombre}** a $${minProduct.precio}.`;
    }

    // 3. Total de productos
    if (lowerQuestion.includes("cuántos productos") || lowerQuestion.includes("total de productos")) {
      return `📊 Tenemos **${mockData.carta.length} productos** en la carta.`;
    }

    // 4. Productos por categoría
    if (lowerQuestion.includes("categoría") || lowerQuestion.includes("categoria")) {
      const catName = lowerQuestion.split("categoría")[1]?.trim().split(" ")[0] || 
                      lowerQuestion.split("categoria")[1]?.trim().split(" ")[0];
      if (catName) {
        const category = mockData.categorias.find(c => 
          c.nombre_cat.toLowerCase().includes(catName)
        );
        if (category) {
          const products = mockData.carta.filter(p => p.categoria === category.id_categoria);
          if (products.length > 0) {
            const list = products.map(p => `🍽️ ${p.nombre} - $${p.precio}`).join("\n");
            return `📋 Productos en **${category.nombre_cat}**:\n${list}`;
          } else {
            return `🔍 No hay productos en la categoría **${category.nombre_cat}**.`;
          }
        } else {
          return `❌ No encontré la categoría "${catName}".`;
        }
      }
    }

    // 5. Stock de un producto
    if (lowerQuestion.includes("stock") || lowerQuestion.includes("inventario")) {
      const productName = lowerQuestion.replace(/stock|inventario|de|el|la/gi, "").trim();
      const product = mockData.inventario.find(inv => 
        inv.nombre_producto.toLowerCase().includes(productName.toLowerCase())
      );
      if (product) {
        return `📦 **${product.nombre_producto}**: ${product.stock_actual} ${product.unidad_stock}.`;
      } else {
        return `🔍 No encontré stock para "${productName}".`;
      }
    }

    // 6. Mesas disponibles
    if (lowerQuestion.includes("mesas disponibles") || lowerQuestion.includes("mesas libres")) {
      const available = mockData.mesas.filter(m => m.disponibilidad);
      if (available.length > 0) {
        const list = available.map(m => `🪑 ${m.nombre} (capacidad: ${m.capacidad})`).join("\n");
        return `✅ Mesas disponibles:\n${list}`;
      } else {
        return "❌ No hay mesas disponibles en este momento.";
      }
    }

    // Respuesta por defecto
    return "🔍 No entendí tu pregunta. Puedes preguntar por:\n- Producto más caro/barato\n- Total de productos\n- Productos por categoría\n- Stock de un producto\n- Mesas disponibles";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(async () => {
      const botResponseText = await queryDatabase(inputValue);
      const botMessage = {
        text: botResponseText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full shadow-md z-10">
        <HeaderCom />
      </div>

      {/* Chatbot WhatsApp-style */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-lg rounded-lg mt-4 mb-4 overflow-hidden">
        {/* Header del chat */}
        <div className="bg-green-500 text-white p-3 flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            🤖
          </div>
          <div>
            <h3 className="font-bold">Asistente IA</h3>
            <p className="text-xs">En línea</p>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100" style={{ height: '500px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'} text-right`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input para escribir mensaje */}
        <div className="p-3 bg-white border-t flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartaPage;