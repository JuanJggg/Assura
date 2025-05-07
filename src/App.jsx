import React from "react";
import { useNavigate } from "react-router-dom"; 
import './App.css'

function App() {
  const navigate = useNavigate();
  
  const asesores = [
    { id: 1, nombre: "Asesor", materia: "Cálculo vectorial" },
    { id: 2, nombre: "Asesor", materia: "Álgebra lineal" },
    { id: 3, nombre: "Asesor", materia: "Mecánica de fluidos" },
    { id: 4, nombre: "Asesor", materia: "Electromagnetismo" },
  ];
  
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Encabezado */}
      <header className="relative bg-gray-200 text-white p-4 flex items-center justify-between shadow-md overflow-hidden">
        <div className="flex items-center gap-4 z-10 w-full h-10">
          <img src="/LogoCompleto.png" alt="logo usuario" className="w-52 h-20 cursor-pointer" />
        </div>
        <div className="flex">
        <input type="text" placeholder="Busqueda" className="rounded-2xl p-2 w-64 text-gray-800 focus:bg-gray-100 focus:outline-none mr-4" />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 rounded-4xl bg-white p-1 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => navigate('/Login')}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="relative bg-red-600 text-white w-64 flex flex-col p-6 shadow-md z-10 overflow-hidden">
          <nav className="flex-1">
            <ul>
              <li className="mb-4">
                <a href="#" className="font-semibold hover:text-red-300">Inicio</a>
              </li>
              <li className="mb-4">
                <a href="#" className="font-semibold hover:text-red-300">Asesores</a>
              </li>
              <li className="mb-4">
                <a href="#" className="font-semibold hover:text-red-300">Foro de Asesores</a>
              </li>
              <li>
                <a href="#" className="font-semibold hover:text-red-300">Contactos</a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Asesores Disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {asesores.map((asesor) => (
              <div
                key={asesor.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center transform transition-transform duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">{asesor.nombre}</h3>
                <p className="text-sm text-gray-500">{asesor.especialidad}</p>
                <button className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline">
                  Contactar
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
