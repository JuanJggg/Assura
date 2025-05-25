import React, {useState} from 'react';
import {Edit, Eye, EyeOff, Trash2} from 'lucide-react';

function SubjectList({subjects, onEdit, onDelete, onToggleActive}) {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [filterActive, setFilterActive] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    const filteredSubjects = (subjects || []).filter(subject => {
        const matchesActive = filterActive === null || subject.activa === (filterActive ? "S" : "N");

        const search = searchTerm.toLowerCase();
        const materia = subject.materia?.toLowerCase() || "";
        const descripcion = subject.descripcion?.toLowerCase() || "";

        const matchesSearch =
            materia.includes(search) ||
            descripcion.includes(search);

        return matchesActive && matchesSearch;
    });


    // const handleDeleteClick = (id) => {
    //     if (confirmDelete === id) {
    //         onDelete(id);
    //         setConfirmDelete(null);
    //     } else {
    //         setConfirmDelete(id);
    //         // Auto reset confirmation state after 3 seconds
    //         setTimeout(() => setConfirmDelete(null), 3000);
    //     }
    // };

    const handleDeleteClick = (id) => {
        setConfirmDelete(id);
        setShowModal(true);
    };

    const handleConfirmDelete = () => {
        console.log('Eliminar ID:', confirmDelete);
        onDelete(confirmDelete);
        setShowModal(false);
        setConfirmDelete(null);
    };

    const handleCancelDelete = () => {
        setShowModal(false);
        setConfirmDelete(null);
    };


    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-gray-800">Tus Materias</h3>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar materias..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>

                        <div className="flex rounded-md shadow-sm">
                            <button
                                onClick={() => setFilterActive(null)}
                                className={`px-3 py-2 text-sm border ${
                                    filterActive === null
                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } rounded-l-md`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFilterActive(true)}
                                className={`px-3 py-2 text-sm border-t border-b ${
                                    filterActive === true
                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Activas
                            </button>
                            <button
                                onClick={() => setFilterActive(false)}
                                className={`px-3 py-2 text-sm border ${
                                    filterActive === false
                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } rounded-r-md`}
                            >
                                Inactivas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {filteredSubjects.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {filteredSubjects.map((subject) => (
                        <li key={subject.id}
                            className={`p-6 transition-colors duration-150 ${!subject.activa === 'S' ? 'bg-gray-50' : ''}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <h4 className="text-lg font-medium text-gray-900">{subject.materia}</h4>
                                        <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            subject.activa === 'S' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                         {subject.activa === 'S' ? 'Activa' : 'Inactiva'}
                                       </span>
                                        <span
                                            className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subject.materia}
                    </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{subject.descripcion}</p>
                                </div>

                                <div
                                    className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-4">
                                    <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-500">Por hora</span>
                                        <span className="font-medium text-gray-900">${subject.precio_hora}</span>
                                    </div>

                                    <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-500">Por sesión</span>
                                        <span className="font-medium text-gray-900">${subject.precio_sesion}</span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onEdit(subject)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                            title="Editar"
                                        >
                                            <Edit className="h-5 w-5"/>
                                        </button>

                                        <button
                                            onClick={() => onToggleActive(subject.id, subject.activa)}
                                            className={`p-2 ${
                                                subject.activa === 'S'
                                                    ? 'text-amber-600 hover:bg-amber-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                            } rounded-full transition-colors duration-200`}
                                            title={subject.activa === 'S' ? 'Desactivar' : 'Activar'}
                                        >
                                            {subject.activa === 'S' ? <EyeOff className="h-5 w-5"/> :
                                                <Eye className="h-5 w-5"/>}
                                        </button>

                                        {/*<button*/}
                                        {/*    onClick={() => handleDeleteClick(subject.id)}*/}
                                        {/*    className={`p-2 ${*/}
                                        {/*        confirmDelete === subject.id*/}
                                        {/*            ? 'bg-red-100 text-red-600'*/}
                                        {/*            : 'text-red-600 hover:bg-red-50'*/}
                                        {/*    } rounded-full transition-colors duration-200`}*/}
                                        {/*    title={confirmDelete === subject.id ? 'Confirmar eliminación' : 'Eliminar'}*/}
                                        {/*>*/}
                                        {/*    <Trash2 className="h-5 w-5"/>*/}
                                        {/*</button>*/}
                                        <button
                                            onClick={() => handleDeleteClick(subject.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-5 w-5"/>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron materias</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm
                            ? `No se encontraron materias que coincidan con "${searchTerm}".`
                            : filterActive !== null
                                ? `No tienes materias ${filterActive ? 'activas' : 'inactivas'}.`
                                : 'Comienza agregando tu primera materia para ofrecer asesorías.'}
                    </p>
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center "
                     style={{backgroundColor: '#0000006b'}}>
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">¿Confirmar eliminación?</h2>
                        <p className="text-sm text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SubjectList;