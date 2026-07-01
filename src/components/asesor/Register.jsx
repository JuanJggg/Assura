import React, {useState} from "react";
import Menu from "./../menu";
import Header from "./../header";

import SubjectRegistration from "./SubjectRegistration";
import MateriaRegistration from "./MateriaRegistration";
import Chatbot from "./Chatbot";

function Register() {
    const [currentPage, setCurrentPage] = useState('asesoria');


    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans">
            {/* Encabezado */}
            <Header/>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Menu/>

                {/* Contenido principal */}
                <main className="flex-1 bg-gray-100 overflow-hidden" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="p-8" style={{ flexShrink: 0 }}>
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <button
                                    onClick={() => setCurrentPage('asesoria')}
                                    className={`mr-4 py-2 px-4 rounded-md transition-colors duration-200 ${
                                        currentPage === 'asesoria'
                                            ? 'bg-red-600 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-indigo-100'
                                    }`}
                                >
                                    Asesorias
                                </button>
                                <button
                                    onClick={() => setCurrentPage('materia')}
                                    className={`mr-4 py-2 px-4 rounded-md transition-colors duration-200 ${
                                        currentPage === 'materia'
                                            ? 'bg-red-600 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-indigo-100'
                                    }`}
                                >
                                    Materias
                                </button>
                                <button 
                                    onClick={() => setCurrentPage('chat')}
                                    className={`mr-4 py-2 px-4 rounded-md transition-colors duration-200 ${
                                        currentPage === 'chat'
                                            ? 'bg-red-600 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-indigo-100'
                                    }`}>
                                    Chats
                                </button>

                            </div>
                        </div>

                        {/* Renderizar con display:none para NO desmontar el Chatbot */}
                        <div style={{ display: currentPage === 'asesoria' ? 'block' : 'none' }}>
                            <SubjectRegistration/>
                        </div>
                        <div style={{ display: currentPage === 'materia' ? 'block' : 'none' }}>
                            <MateriaRegistration/>
                        </div>
                    </div>
                    {/* Chatbot fuera del padding para que ocupe todo el espacio disponible */}
                    <div style={{ display: currentPage === 'chat' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
                        <Chatbot/>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Register;