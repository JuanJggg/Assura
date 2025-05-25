import React, {useState} from "react";
import Menu from "./../menu";
import Header from "./../header";

import SubjectRegistration from "./SubjectRegistration";
import MateriaRegistration from "./MateriaRegistration";

function Register() {
    const [currentPage, setCurrentPage] = useState('asesoria');


    const renderContent = () => {
        switch (currentPage) {
            case 'materia':
                return <MateriaRegistration/>;
            case 'asesoria':
                return <SubjectRegistration/>;
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans">
            {/* Encabezado */}
            <Header/>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Menu/>

                {/* Contenido principal */}
                <main className="flex-1 bg-gray-100 overflow-y-auto">
                    <div className="p-8">
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <button
                                    onClick={() => setCurrentPage('asesoria')}
                                    className={`mr-4 py-2 px-4 rounded-md transition-colors duration-200 ${
                                        currentPage === 'asesoria'
                                            ? 'bg-indigo-500 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-indigo-100'
                                    }`}
                                >
                                    Asesorias
                                </button>
                                <button
                                    onClick={() => setCurrentPage('materia')}
                                    className={`mr-4 py-2 px-4 rounded-md transition-colors duration-200 ${
                                        currentPage === 'materia'
                                            ? 'bg-indigo-500 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-indigo-100'
                                    }`}
                                >
                                    Materias
                                </button>

                            </div>
                        </div>

                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Register;