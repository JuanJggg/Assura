import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import "../App.css";

function Menu() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {label: "Inicio", href: "/Dashboard"},
        {label: "Asesores", href: "/Asesor"},
        {label: "Foro de Asesores", href: "/Forum"},
        {label: "Contactos", href: "/Contactos"},
    ];

    return (
        <aside
            className="bg-gray-100 text-gray-800 w-56 flex flex-col p-3 shadow-md min-h-screen border-r border-gray-300">
            <nav className="flex-1">
                <ul>
                    {menuItems.map(({label, href}) => {
                        const isActive = location.pathname === href;
                        return (
                            <li key={label} className="mb-2">
                                <button
                                    onClick={() => navigate(href)}
                                    className={`flex items-center w-full text-left px-3 py-2 rounded-md transition-colors duration-150 text-sm
                    ${isActive
                                        ? "bg-white text-red-600 font-bold shadow-inner"
                                        : "hover:bg-gray-200 text-gray-700 font-medium"
                                    }`}
                                >
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}

export default Menu;
