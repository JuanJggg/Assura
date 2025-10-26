import React from "react";
import '../App.css';
import {useNavigate} from "react-router-dom";

function Header() {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {} ; // asegúrate de que existe

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <header className="bg-gray-200 text-black px-4 py-2 flex items-center justify-between shadow-md h-16">
            {/* Logo */}
            <div className="flex items-center">
                <img src="/LogoCompleto.png" alt="logo usuario" className="h-10 w-auto cursor-pointer"/>
            </div>

            {/* Buscador */}
            <div className="flex-1 flex justify-center px-4">
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="rounded-xl px-3 py-1 w-52 text-gray-800 text-sm focus:bg-gray-100 focus:outline-none border border-gray-400"
                />
            </div>

            {/* Usuario y botón de logout */}
            <div className="flex items-center gap-3">
                {usuario && (
                    <span className="text-sm font-medium text-gray-800">
            Bienvenido, <span className="text-red-600">{`${usuario.nombres} ${usuario.apellidos}`}</span>
          </span>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md shadow transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                        />
                    </svg>
                    {/*Cerrar sesión*/}
                </button>

            </div>
        </header>
    );
}

export default Header;
