import React, {useEffect, useState} from "react";
import ForumForm from "./ForumForm";
import CommentForm from "./CommentForm";
import axios from "axios";
import Toast from "../util/alert.jsx";


const Form = () => {
    const usuario = JSON.parse(localStorage.getItem("token"))?.[0]; // asegúrate de que existe
    const [showForm, setShowForm] = useState(false);
    const [topics, setTopics] = useState([]);
    const [coments, setComments] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        dataInicial();
    }, []);

    const dataInicial = async () => {
        try {
            const res = await axios.post(
                "http://localhost:3001/foro/getForos");
            console.log("respuesta", res.data);

            setTopics(res.data);
            getComentarios();

        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    }

    const getComentarios = async () => {
        try {

            const resultado = await axios.post(
                "http://localhost:3001/foro/getComentario");
            console.log("respuesta", resultado.data);

            setComments(resultado.data);

        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    }


    const handleSubmit = async (formData) => {
        try {
            const res = await axios.post(
                "http://localhost:3001/foro/addForo", {
                    ...formData, id: usuario.id, rol: usuario.rol,
                });
            console.log("respuesta", res.data);
            // Mostrar toast de éxito
            setToast({
                type: res.data?.success ? 'success' : 'error',
                message: res.data?.mensaje || "Foro registrado correctamente",
            });
            dataInicial();
            setShowForm(false);

        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleComment = async (topicId, commentData) => {
        console.log(topicId, commentData)
        try {


            const res = await axios.post('http://localhost:3001/foro/addComentario', {
                idForo: topicId,
                comentario: commentData.content,
                id: usuario.id,
                rol: usuario.rol,
            });
            console.log("respuesta", res.data);
            // Mostrar toast de éxito
            setToast({
                type: res.data?.success ? 'success' : 'error',
                message: res.data?.mensaje || "Comentario registrado correctamente",
            });
            dataInicial();
            getComentarios();
        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    };


    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Foros de Discusión
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105"
                >
                    {showForm ? "Cancelar" : "Nuevo Foro"}
                </button>
            </div>


            {showForm && (
                <div className="mb-8 transition-all duration-300 ease-in-out">
                    <ForumForm
                        onSubmit={handleSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <div className="space-y-6">
                {topics.map((topic) => (
                    <div key={topic.id}
                         className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                        <div
                            className="cursor-pointer"
                            onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer">
                                    {topic.titulo}
                                </h3>
                                <span className="bg-indigo-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {topic.comentarios}{" "}
                                    {topic.comentarios === 1 ? "respuesta" : "respuestas"}
              </span>
                            </div>
                            <p className="mt-2 text-gray-600 line-clamp-2">
                                {topic.descripcion}
                            </p>
                            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                <span>Por: {topic.creado_por}</span>
                                <span>{formatDate(new Date(topic.fecha))}</span>
                            </div>
                        </div>
                        {selectedTopic?.id === topic.id && (
                            <div className="mt-6 border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Comentarios</h4>
                                <div className="space-y-4 mb-6">
                                    {coments.filter(x => x.id_foro === selectedTopic?.id).map(comment => (
                                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700">{comment.contenido}</p>
                                            <div
                                                className="mt-2 flex justify-between items-center text-sm text-gray-500">
                                                <span>{comment.creado_por}</span>
                                                <span>{formatDate(new Date(comment.fecha))}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <CommentForm
                                    onSubmit={(commentData) => handleComment(topic.id, commentData)}
                                />
                            </div>
                        )}
                    </div>
                ))}

            </div>
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

        </div>
    );
};

export default Form;
