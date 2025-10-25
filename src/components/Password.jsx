import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingrese un correo válido.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await axios.post(`${API_URL}/usuarios/forgotPassword`, { email });
      if (res.data.ok) {
        setMensaje("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
      } else {
        setError(res.data.mensaje);
      }
    } catch (err) {
      console.error(err);
      setError("Hubo un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-white overflow-hidden relative">
      {/* Logo superior */}
      <div className="absolute top-0 w-full p-4 flex items-center space-x-2">
        <img
          onClick={() => navigate("/")}
          src="/public/LogoCompleto.png"
          alt="logo"
          className="w-50 h-20 cursor-pointer"
        />
      </div>

      {/* Tarjeta de recuperación */}
      <div className="relative z-10 mt-6 p-10 bg-white rounded-xl shadow-2xl border border-gray-300">
        <img
          src="/public/LogoCompleto.png"
          alt="logo"
          className="w-full h-full m-auto"
        />
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Recuperar Contraseña
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-semibold mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="Ingresa tu correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-red-600 focus:outline-none"
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {mensaje && <p className="text-green-600 text-sm mb-2">{mensaje}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-red-500 transition cursor-pointer disabled:opacity-70"
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600 flex justify-center space-x-2">
          <p
            className="text-red-600 font-semibold hover:underline cursor-pointer"
            onClick={() => navigate("/")}
          >
            Volver al inicio de sesión
          </p>
        </div>
      </div>

      {/* SVG decorativo inferior */}
      <svg
        className="absolute bottom-0 left-0 w-full text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="currentColor"
          fillOpacity="1"
          d="M0,256L60,234.7C120,213,240,171,360,170.7C480,171,600,213,720,234.7C840,256,960,256,1080,245.3C1200,235,1320,213,1380,202.7L1440,192V320H1380C1200,320,960,320,720,320,480,320,240,320,60,320H0Z"
        />
      </svg>
    </div>
  );
}

export default ForgotPassword;
