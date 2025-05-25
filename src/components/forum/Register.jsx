import React from "react";
import '../../App.css'
import Menu from "../menu";
import Header from "../header";
import Form from "./Form";

function RegisterForum() {

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans">
            {/* Encabezado */}
            <Header/>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Menu/>

                {/* Contenido principal */}
                <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
                    <Form/>
                </main>
            </div>
        </div>

    )
}


export default RegisterForum;