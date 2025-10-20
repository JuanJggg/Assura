import React, { useState, useRef } from "react";
import Menu from "./../menu";
import Header from "./../header";

function Chatstudy() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Sandra Ortiz",
      status: "Asesor de Cálculo",
      lastMessage: "¿Tienes dudas sobre la tarea?",
      lastMessageTime: "10:30 AM",
      unreadCount: 2,
      messages: [
        {
          content: "Hola, ¿cómo puedo ayudarte con cálculo?",
          time: "10:25 AM",
          isSender: false,
        },
        {
          content: "Tengo dudas sobre derivadas parciales",
          time: "10:28 AM",
          isSender: true,
        },
        {
          content: "¿Tienes dudas sobre la tarea?",
          time: "10:30 AM",
          isSender: false,
        },
      ],
    },
    {
      id: 2,
      name: "Miguel Angel",
      status: "Asesora de Física",
      lastMessage: "Claro, nos vemos en la sesión",
      lastMessageTime: "9:45 AM",
      unreadCount: 0,
      messages: [
        {
          content: "¿Podemos agendar una asesoría?",
          time: "9:40 AM",
          isSender: true,
        },
        {
          content: "Claro, nos vemos en la sesión",
          time: "9:45 AM",
          isSender: false,
        },
      ],
    },
  ]);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      const newMessage = {
        content: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSender: true,
      };

      setChats(
        chats.map((chat) => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: message,
              lastMessageTime: newMessage.time,
              unreadCount: 0,
            };
          }
          return chat;
        })
      );

      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        {/* Chat Layout */}
        <div className="flex h-full bg-gray-100 flex-1">
          {/* Chat List */}
          <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
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
                        {chat.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chat.lastMessageTime}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">
                          {chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col h-full">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold">
                      {selectedChat.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedChat.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.status}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                >
                  {selectedChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.isSender ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md rounded-lg p-3 ${
                          msg.isSender
                            ? "bg-red-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isSender
                              ? "text-red-200"
                              : "text-gray-500"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
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
      </div>
    </div>
  );
}

export default Chatstudy;

