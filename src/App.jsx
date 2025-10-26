import React, { useEffect, useState } from "react";
import "./App.css";
import Menu from "./components/menu";
import Header from "./components/header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [asesores, setAsesores] = useState([]);
  const [comentario, setComentario] = useState([]);

  useEffect(() => {
    // Debug: Ver qué usuario está logueado
    console.log("Usuario logueado:", usuario);
    getAsesores();
    getComentarios();
  }, []);

  const getAsesores = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/dasboard/getAsesores"
      );
      console.log("respuesta asesores", res.data);
      setAsesores(res.data);
    } catch (err) {
      console.log("Error al obtener asesores", err);
      alert("Error al obtener asesores");
    }
  };

  const getComentarios = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/dasboard/getComentario"
      );
      console.log("respuesta comentarios", res.data);
      setComentario(res.data);
    } catch (err) {
      console.log("Error al obtener comentarios", err);
      alert("Error al obtener comentarios");
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleClick = async (asesorId) => {
    // Verificar si el usuario está logueado
    if (!usuario || !usuario.id) {
      alert("Debes iniciar sesión primero");
      navigate("/login");
      return;
    }

    console.log("=== INICIANDO CREACIÓN DE CONVERSACIÓN ===");
    console.log("Usuario ID:", usuario.id);
    console.log("Asesor ID:", asesorId);
    console.log("Usuario completo:", usuario);

    // Validar que el asesorId exista
    if (!asesorId) {
      alert("Error: ID de asesor no válido");
      return;
    }

    try {
      const payload = {
        id_estudiante: usuario.id,
        id_asesor: asesorId
      };

      console.log("Payload a enviar:", payload);

      // Crear o obtener conversación existente
      const res = await axios.post(
        "http://localhost:3001/chat/crearConversacion",
        payload
      );

      console.log("Respuesta completa del servidor:", res.data);

      if (res.data.ok) {
        console.log("✅ Conversación creada exitosamente");
        console.log("ID de conversación:", res.data.conversacion.id);
        
        // Redirigir al chat
        navigate("/Chatstudy", { 
          state: { 
            chatId: res.data.conversacion.id,
            conversacion: res.data.conversacion
          } 
        });
      } else {
        console.error("❌ Respuesta no exitosa:", res.data);
        alert("No se pudo crear la conversación");
      }
    } catch (err) {
      console.error("=== ERROR AL CREAR CONVERSACIÓN ===");
      console.error("Error completo:", err);
      console.error("Respuesta del servidor:", err.response?.data);
      console.error("Status:", err.response?.status);
      console.error("Headers:", err.response?.headers);
      
      // Mostrar mensaje de error más detallado
      if (err.response?.data?.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
        alert("No se pudo iniciar el chat. Revisa la consola para más detalles.");
      }
    }
  };

  // Datos para tareas pendientes
  const tareasIzquierda = [
    {
      id: 1,
      assigned: "Noticias de Assura",
      name: "Philip Smead",
      date: "April, 25",
      priority: "New",
    },
    {
      id: 2,
      assigned: "Themesdesign",
      name: "Brent Shipley",
      date: "April, 28",
      priority: "High",
    },
    {
      id: 3,
      assigned: "Noticias de Assura",
      name: "Kevin Ashley",
      date: "June, 12",
      priority: "Medium",
    },
    {
      id: 4,
      assigned: "Themesdesign",
      name: "Martin Whitmer",
      date: "June, 28",
      priority: "Medium",
    },
  ];

  // Datos para el segundo componente de tareas pendientes
  const tareasDerecha = [
    {
      id: 1,
      assigned: "Noticias de Assura",
      name: "Enrique Peters",
      date: "July, 15",
      priority: "High",
    },
    {
      id: 2,
      assigned: "Themesdesign",
      name: "Richard Schnell",
      date: "July, 30",
      priority: "New",
    },
    {
      id: 3,
      assigned: "Noticias de Assura",
      name: "Dennis Jackson",
      date: "August, 08",
      priority: "Medium",
    },
    {
      id: 4,
      assigned: "Noticias de Assura",
      name: "Carlos Rodrigues",
      date: "August, 23",
      priority: "Low",
    },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Encabezado */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Menu />

        {/* Contenido principal */}
        <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          {/* Debug info - Puedes comentar esto después */}
          {usuario && usuario.id && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>Usuario logueado:</strong> ID: {usuario.id} - {usuario.nombre || usuario.nombres || 'Sin nombre'}
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Asesores Disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {asesores.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hay asesores disponibles en este momento.</p>
              </div>
            ) : (
              asesores.map((asesor, index) => (
                <div
                  key={asesor.id_asesor || index}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center transform transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {asesor.asesor || "Sin nombre"}
                  </h3>
                  <p className="text-sm text-gray-500">{asesor.telefono || "Sin teléfono"}</p>
                  <p className="text-sm text-gray-500">{asesor.materia || "Sin materia"}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {asesor.id_asesor}</p>
                  <button
                    onClick={() => handleClick(asesor.id_asesor)}
                    className="mt-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors"
                  >
                    Contactar
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Mensajes */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-center items-center space-x-8 border-b border-black/20 pb-4 mb-6 text-center text-gray-400 font-semibold text-sm select-none">
                <div>
                  <p className="text-cyan-500 font-bold text-lg">
                    {comentario.length}
                  </p>
                  <p>Comentarios</p>
                </div>
              </div>

              {/* Lista de mensajes */}
              <div>
                {comentario.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No hay comentarios aún</p>
                ) : (
                  comentario.slice(0, 3).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-4 border-b border-black/20 ${
                        i === 2 ? "border-0" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar con inicial */}
                        <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-semibold uppercase">
                          {msg.usuario ? msg.usuario.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">
                            {msg.usuario || "Anónimo"}
                          </p>
                          <p className="text-sm text-gray-500">{msg.contenido || ""}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {msg.fecha ? formatDate(new Date(msg.fecha)) : ""}
                      </span>
                    </div>
                  ))
                )}

                <button
                  onClick={() => navigate("/Forum")}
                  className="mt-4 text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-full text-sm cursor-pointer transition-colors"
                >
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-gray-800 font-semibold mb-4">
                Comentarios destacados
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-red-600 font-medium">Now</p>
                  <p className="text-gray-600">
                    Andrei Coman magna sed porta finibus, risus posted a new
                    article:{" "}
                    <span className="text-cyan-500 hover:underline cursor-pointer">
                      Forget UX Rowland
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-red-600 font-medium">Yesterday</p>
                  <p className="text-gray-600">
                    Andrei Coman posted a new article:{" "}
                    <span className="text-cyan-500 hover:underline cursor-pointer">
                      Designer Alex
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-red-600 font-medium">2:30PM</p>
                  <p className="text-gray-600">
                    Zack Wetas commented:{" "}
                    <span className="text-cyan-500 hover:underline cursor-pointer">
                      Developer Moreno
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-red-600 font-medium">12:48PM</p>
                  <p className="text-gray-600">
                    Zack & Chris commented:{" "}
                    <span className="text-cyan-500 hover:underline cursor-pointer">
                      UX Murphy
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Redes sociales*/}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h3 className="text-gray-800 font-semibold mb-4">
                Redes Sociales
              </h3>
              {[
                {
                  name: "Facebook",
                  color: "text-blue-600",
                  bg: "bg-blue-600",
                  icon: (
                    <path d="M22 12a10 10 0 10-11.78 9.88v-7H8v-3h2.22V9.5c0-2.2 1.3-3.42 3.3-3.42.96 0 1.97.17 1.97.17v2.17H14.9c-1.1 0-1.44.69-1.44 1.4V12h2.45l-.39 3h-2.06v7A10 10 0 0022 12z" />
                  ),
                },
                {
                  name: "X",
                  color: "text-gray-800",
                  bg: "bg-gray-800",
                  icon: (
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  ),
                },
              ].map((platform, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center justify-center"
                >
                  <svg
                    className={`w-8 h-8 ${platform.color} mb-2`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {platform.icon}
                  </svg>
                  <h4 className={`text-xl font-bold ${platform.color}`}>
                    {platform.count}
                  </h4>
                  <p className="text-gray-500 text-sm">New Peoples</p>
                  <p className="text-gray-400 text-xs">
                    Your main list is growing
                  </p>
                  <button className="mt-2 text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors">
                    Following you
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Tabla de Comentarios
              </h3>

              <div className="grid grid-cols-12 gap-2 border-b pb-3 mb-3 text-sm font-medium text-gray-600">
                <div className="col-span-1"></div>
                <div className="col-span-3">Assigned</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Priority</div>
              </div>

              {tareasIzquierda.map((tarea) => (
                <div
                  key={tarea.id}
                  className="grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center text-sm"
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-3 text-gray-700">
                    {tarea.assigned}
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-800">{tarea.name}</span>
                  </div>
                  <div className="col-span-3 text-gray-600">{tarea.date}</div>
                  <div className="col-span-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tarea.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : tarea.priority === "Medium"
                          ? "bg-green-100 text-green-600"
                          : tarea.priority === "Low"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-red-600"
                      }`}
                    >
                      {tarea.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Tabla de Comentarios
              </h3>
              <div className="grid grid-cols-12 gap-2 border-b pb-3 mb-3 text-sm font-medium text-gray-600">
                <div className="col-span-1"></div>
                <div className="col-span-3">Assigned</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Priority</div>
              </div>

              {tareasDerecha.map((tarea) => (
                <div
                  key={tarea.id}
                  className="grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center text-sm"
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-3 text-gray-700">
                    {tarea.assigned}
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-800">{tarea.name}</span>
                  </div>
                  <div className="col-span-3 text-gray-600">{tarea.date}</div>
                  <div className="col-span-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tarea.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : tarea.priority === "Medium"
                          ? "bg-green-100 text-green-600"
                          : tarea.priority === "Low"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-red-600"
                      }`}
                    >
                      {tarea.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;