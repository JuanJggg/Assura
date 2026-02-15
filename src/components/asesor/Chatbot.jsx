import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import pusher from "../../services/pusher";

function Chatbot() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const notificationChannelRef = useRef(null);
  const selectedChatIdRef = useRef(selectedChatId);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const userId = usuario.id;

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;

    console.log("Suscribiéndose al canal: chat-" + selectedChatId);
    const channel = pusher.subscribe(`chat-${selectedChatId}`);
    channelRef.current = channel;

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Suscripción exitosa al canal: chat-" + selectedChatId);
    });

    channel.bind("pusher:subscription_error", (err) => {
      console.error("Error al suscribirse al canal chat-" + selectedChatId, err);
    });

    channel.bind("nuevo-mensaje", (data) => {
      console.log("Mensaje recibido en chat-" + selectedChatId + ":", data);
      console.log("   Usuario que envió:", data.remitente_id);
      console.log("   Usuario actual:", userId);
      console.log("   ¿Es de otro usuario?", data.remitente_id != userId);

      if (data.remitente_id != userId) {
        console.log("Agregando mensaje a la lista");
        setMessages((prev) => [...prev, data]);
      } else {
        console.log("Mensaje propio, ignorando (ya está en la lista)");
      }
    });

    return () => {
      if (channelRef.current) {
        console.log("Desuscribiéndose del canal: chat-" + selectedChatId);
        channelRef.current.unbind_all();
        pusher.unsubscribe(`chat-${selectedChatId}`);
      }
    };
  }, [selectedChatId, userId]);

  useEffect(() => {
    if (!userId) return;

    console.log("Suscribiéndose al canal de notificaciones: asesor-" + userId);
    const notificationChannel = pusher.subscribe(`asesor-${userId}`);
    notificationChannelRef.current = notificationChannel;

    notificationChannel.bind("pusher:subscription_succeeded", () => {
      console.log("Suscripción exitosa al canal: asesor-" + userId);
    });

    notificationChannel.bind("pusher:subscription_error", (err) => {
      console.error("Error al suscribirse al canal asesor-" + userId, err);
    });

    notificationChannel.bind("nueva-conversacion", (data) => {
      console.log("Nueva conversación recibida:", data);
      cargarConversaciones();
    });

    notificationChannel.bind("nuevo-mensaje-notificacion", (data) => {
      console.log("Notificación de nuevo mensaje:", data);
      console.log("   ID conversación recibida:", data.id_conversacion);
      console.log("   ID conversación actual:", selectedChatIdRef.current);

      cargarConversaciones();

      if (data.id_conversacion == selectedChatIdRef.current) {
        console.log("Es el chat actual, recargando mensajes...");
        cargarMensajes(selectedChatIdRef.current);
      } else {
        console.log("No es el chat actual, solo se actualiza la lista");
      }
    });

    return () => {
      if (notificationChannelRef.current) {
        console.log("Desuscribiéndose del canal: asesor-" + userId);
        notificationChannelRef.current.unbind_all();
        pusher.unsubscribe(`asesor-${userId}`);
      }
    };
  }, [userId]);

  const cargarConversaciones = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/chat/getConversacion/asesor/${userId}`
      );

      if (res.data.ok) {
        const conversaciones = res.data.conversaciones.map((conv) => ({
          id: conv.id,
          name: `${conv.estudiante_nombre} ${conv.estudiante_apellido}`,
          status: "Estudiante",
          lastMessage: conv.ultimo_mensaje || "Sin mensajes",
          lastMessageTime: conv.ultima_actividad
            ? new Date(conv.ultima_actividad).toLocaleString("es-ES", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        }));

        setChats(conversaciones);

        if (conversaciones.length > 0 && !selectedChatId) {
          setSelectedChatId(conversaciones[0].id);
        }
      }
    } catch (err) {
      console.log("Error al cargar conversaciones:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      cargarConversaciones();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedChatId) {
      cargarMensajes(selectedChatId);
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
      senderId: userId,
    };

    console.log("Enviando mensaje:", messageData);

    try {
      const tempMessage = {
        id_conversacion: selectedChatId,
        contenido: message.trim(),
        remitente_id: userId,
        remitente_tipo: 'asesor',
        fecha_envio: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);

      console.log("Llamando al backend: POST http://localhost:3001/chat/mensajes");
      const response = await axios.post(`http://localhost:3001/chat/mensajes`, messageData);
      console.log("Respuesta del backend:", response.data);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                lastMessage: message.trim(),
                lastMessageTime: new Date().toLocaleString("es-ES", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }
            : chat
        )
      );

      setMessage("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      console.error("Detalles:", err.response?.data || err.message);
    }
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="flex h-full bg-gray-100">
          {/* Lista de chats */}
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

          {/* Ventana de chat */}
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
                    const isSender = msg.remitente_id == userId;
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
                                  hour12: true,
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
