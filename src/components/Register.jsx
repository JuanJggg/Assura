import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    codigo: "",
    roles: "",
    telefono: "",
    carrera: "",
    email: "",
    password: "",
  });

  const [errores, setErrores] = useState({});

  const validarCampo = (nombre, valor) => {
    let error = "";
    console.log(nombre);
    switch (nombre) {
      case "nombres":
        if (!valor.trim()) error = "Nombre requerido";
        break;
      case "apellidos":
        if (!valor.trim()) error = "Apellido requerido";
        break;
      case "codigo":
        if (!valor.trim()) {
          error = "Código requerido";
        }
        if (!/^\d+$/.test(valor)) {
          error = "El código debe contener solo números";
        }
        console.log(error);
        break;
      case "carrera":
        if (!valor.trim()) error = "Carrera requerida";
        break;
      case "email":
        if (!/\S+@\S+\.\S+/.test(valor)) error = "Correo inválido";
        break;
      case "password":
        if (valor.length < 6) error = "Mínimo 6 caracteres";
        break;
      case "roles":
        if (!valor.trim()) error = "Rol requerido";
        break;
      case "telefono":
        if (!valor.trim()) {
          error = "Telefono requerido";
        }
        if (!/^\d+$/.test(valor)) {
          error = "El telefono debe contener solo números";
        }
        if ((valor.length > 0) & (valor.length > 10 || valor.length < 10)) {
          error = "Telefono reuqerido y minimo 10 numeros";
        }
        console.log(error);
    }

    setErrores((prev) => ({ ...prev, [nombre]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(name);
    validarCampo(name, value); // validar en tiempo real
  };

  const onRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("enviar",formData);
  
      const res = await axios.post('http://localhost:3001/usuarios/addUser',formData);
      console.log("respuesta",res.data);
      alert(res.data.mensaje);
    } catch (err) {
      console.err(err);
      alert("Error al registrar");
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  console.log(formData, errores);
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

      {/* Formulario de registro */}
      <div className="relative z-10 mt-6 p-10 px-23 bg-white rounded-xl shadow-2xl border border-gray-300">
        <img
          src="/public/LogoCompleto.png"
          alt="logo"
          className="w-full h-full m-auto"
        />
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Registro de Usuario
        </h2>
        <div className="flex">
          <div>
            {/* Nombres */}
            <div className="mb-4 ">
              <label className="block text-gray-700 font-semibold mb-1">
                Nombres
              </label>
              <input
                type="text"
                name="nombres"
                required
                value={formData.nombres}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.nombres && "border-1 border-red-600"
                }`}
                placeholder="Ingrese sus nombres"
              />
              {errores.nombres && (
                <p className="text-red-600 text-sm">{errores.nombres}</p>
              )}
            </div>

            {/* Apellidos */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.apellidos && "border-1 border-red-600"
                }`}
                placeholder="Ingrese sus apellidos "
              />
              {errores.apellidos && (
                <p className="text-red-600 text-sm">{errores.apellidos}</p>
              )}
            </div>

            {/* Codigo */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Codigo
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.codigo && "border-1 border-red-600"
                }`}
                placeholder="Ingrese su codigo estudiantil"
              />
              {errores.codigo && (
                <p className="text-red-600 text-sm">{errores.codigo}</p>
              )}
            </div>

            {/* Rol */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Rol
              </label>
              <input
                list="rolesgenerales"
                type="text"
                name="roles"
                id="roles"
                value={formData.roles}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.roles && "border-1 border-red-600"
                }`}
                placeholder="Ingrese el rol que desea"
              />
              <datalist id="rolesgenerales">
                <option value="Asesor" />
                <option value="Estudiante" />
              </datalist>
              {errores.roles && (
                <p className="text-red-600 text-sm">{errores.roles}</p>
              )}
            </div>
          </div>

          <div className="ml-5">
            {/* Telefono */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Telefono
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.telefono && "border-1 border-red-600"
                }`}
                placeholder="Ingrese su Telefono"
              />
              {errores.telefono && (
                <p className="text-red-600 text-sm">{errores.telefono}</p>
              )}
            </div>

            {/* Carrera */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Carrera
              </label>
              <input
                list="carreras"
                name="carrera"
                id="carreraInput"
                value={formData.carrera}
                onChange={handleChange}
                type="text"
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.carrera && "border-1 border-red-600"
                }`}
                placeholder="Ingrese su carrera"
              />
              <datalist id="carreras">
                <option value="Ingeniería de Sistemas" />
                <option value="Ingeniería Civil" />
                <option value="Ingeniería Mecánica" />
                <option value="Ingeniería Ambiental" />
                <option value="Contaduria Publica" />
                <option value="Derecho" />
                <option value="Comunicación Social" />
                <option value="Zootecnia" />
                <option value="Administración de Empresas" />
                <option value="Tecnologia en Gestion Comercial y Financiera" />
              </datalist>
              {errores.carrera && (
                <p className="text-red-600 text-sm">{errores.carrera}</p>
              )}
            </div>

            {/* Correo */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Correo
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.email && "border-1 border-red-600"
                }`}
                placeholder="Ingrese su correo"
              />
              {errores.email && (
                <p className="text-red-600 text-sm">{errores.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-semibold mb-1">
                Contraseña
              </label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition ${
                  errores.password && "border-1 border-red-600"
                }`}
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-9 text-gray-500 hover:text-black mt-0.5"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              {errores.password && (
                <p className="text-red-600 text-sm">{errores.password}</p>
              )}
            </div>
          </div>
        </div>

        {/* Botones de login */}
        <button onClick={onRegister} className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-red-500 transition cursor-pointer">
          Registrarme
        </button>

        {/* Enlaces de ayuda */}
        <div className="mt-4 text-sm text-center text-gray-600 flex justify-center space-x-2">
          <p
            className="text-red-600 font-semibold hover:underline cursor-pointer"
            onClick={() => navigate("/")}
          >
            ¿Ya tienes una cuenta?
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
          d="M0,256L60,234.7C120,213,240,171,360,170.7C480,171,600,213,720,234.7C840,256,960,256,1080,245.3C1200,235,1320,213,1380,202.7L1440,192V320H1380C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320H0Z"
        />
      </svg>
    </div>
  );
}

export default Register;
