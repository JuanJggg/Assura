import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { io } from "socket.io-client";

function Chatbot() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const userId = usuario.id;

  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket conectado - Asesor");
    });

    socketRef.current.on("mensaje", (data) => {
      console.log("Mensaje recibido:", data);
      if (selectedChatId && data.id_conversacion === selectedChatId) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedChatId]);

  useEffect(() => {
    const cargarConversaciones = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/chat/getConversacion/asesor/${userId}`
        );

        if (res.data.ok) {
          const conversaciones = res.data.conversaciones.map(conv => ({
            id: conv.id,
            name: `${conv.estudiante_nombre} ${conv.estudiante_apellido}`,
            status: "Estudiante",
            lastMessage: conv.ultimo_mensaje || "Sin mensajes",
            lastMessageTime: conv.ultima_actividad
              ? new Date(conv.ultima_actividad).toLocaleString("es-ES", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : ""
          }));

          setChats(conversaciones);

          if (conversaciones.length > 0) {
            setSelectedChatId(conversaciones[0].id);
          }
        }
      } catch (err) {
        console.log("Error al cargar conversaciones:", err);
      }
    };

    if (userId) {
      cargarConversaciones();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedChatId) {
      cargarMensajes(selectedChatId);

      if (socketRef.current) {
        socketRef.current.emit("unirse", { chatId: selectedChatId });
      }
    }
  }, [selectedChatId]);

  const cargarMensajes = async (chatId) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/chat/getMensajes/${chatId}`
      );

      if (res.data.ok) {
        setMessages(res.data.mensajes || []);
      }
    } catch (err) {
      console.log("Error al cargar mensajes:", err);
    }
  };

  const [messageCount, setMessageCount] = useState(0);
  useEffect(() => {
    if (messages.length > messageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setMessageCount(messages.length);
    } else if (messageCount === 0 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      setMessageCount(messages.length);
    }
  }, [messages, messageCount]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChatId) return;

    const messageData = {
      chatId: selectedChatId,
      content: message.trim(),
      senderId: userId
    };

    try {
      const tempMessage = {
        id_conversacion: selectedChatId,
        contenido: message.trim(),
        id_remitente: userId,
        id_usuario: userId,
        fecha_envio: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMessage]);

      if (socketRef.current) {
        socketRef.current.emit("mensaje", messageData);
      }

      await axios.post(
        `http://localhost:3001/chat/mensajes`,
        messageData
      );

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChatId
            ? {
                ...chat,
                lastMessage: message.trim(),
                lastMessageTime: new Date().toLocaleString("es-ES", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }
            : chat
        )
      );

      setMessage("");
    } catch (err) {
      console.log("Error al enviar mensaje:", err);
    }
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className="flex h-full bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chats con Estudiantes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {chats.length === 0 ? (
            <p className="text-center text-gray-400 p-4">
              No hay chats disponibles.
            </p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`p-4 hover:bg-red-50 cursor-pointer transition-colors duration-150 ${
                  selectedChatId === chat.id ? "bg-red-50" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-lg">
                      {chat.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {chat.lastMessageTime || ""}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage || "Sin mensajes"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">
                  {selectedChat.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedChat.name || "Chat"}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedChat.status || ""}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => {
                const isSender = (msg.id_remitente == userId) || (msg.id_usuario == userId);
                return (
                  <div
                    key={idx}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md rounded-lg p-3 ${
                        isSender
                          ? "bg-red-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{msg.contenido}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isSender ? "text-red-200" : "text-gray-500"
                        }`}
                      >
                        {msg.fecha_envio
                          ? new Date(msg.fecha_envio).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-gray-200"
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Selecciona un chat para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
