import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    axios
      .get(`${API_URL}/usuarios/validateToken/${token}`)
      .then((res) => {
        if (res.data.ok) setValid(true);
      })
      .catch(() => setError("El enlace ha expirado o es inválido."));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/usuarios/resetPassword/${token}`, { password });
      if (res.data.ok) {
        setMensaje("Contraseña actualizada correctamente. Redirigiendo...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(res.data.mensaje);
      }
    } catch {
      setError("Error al actualizar la contraseña.");
    }
  };

  if (!valid && !error)
    return (
      <div className="text-center mt-20 text-gray-600">Verificando enlace...</div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 mt-20 font-semibold">{error}</div>
    );

  return (
    <div className="flex justify-center items-center w-full h-screen bg-white overflow-hidden relative">
      <div className="absolute top-0 w-full p-4 flex items-center space-x-2">
        <img
          onClick={() => navigate("/")}
          src="/public/LogoCompleto.png"
          alt="logo"
          className="w-50 h-20 cursor-pointer"
        />
      </div>

      <div className="relative z-10 mt-6 p-10 bg-white rounded-xl shadow-2xl border border-gray-300">
        <img
          src="/public/LogoCompleto.png"
          alt="logo"
          className="w-full h-full m-auto"
        />
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Restablecer Contraseña
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-semibold mb-2">
            Nueva contraseña
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-red-600 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="block text-gray-700 font-semibold mb-2">
            Confirmar contraseña
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-red-600 focus:outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {mensaje && <p className="text-green-600 text-sm mb-2">{mensaje}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-500 transition"
          >
            Guardar nueva contraseña
          </button>
        </form>
      </div>

      {/* SVG decorativo */}
      <svg
        className="absolute bottom-0 left-0 w-full text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="currentColor"
          fillOpacity="1"
          d="M0,256L60,234.7C120,213,240,171,360,170.7C480,171,600,213,720,234.7C840,256,960,256,1080,245.3C1200,235,1320,213,1380,202.7L1440,192V320H0Z"
        />
      </svg>
    </div>
  );
}

export default ResetPassword;
