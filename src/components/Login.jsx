import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const onLogin = async (e) => {
        // Aquí va la lógica de inicio de sesión
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3001/usuarios/login', {
                "email": email,
                "password": password
            });
            console.log("respuesta", res.data);

            if (res.data.length > 0) {
                console.log("usuario logueado");
                // alert('Token recibido: '+res.data.token);
                localStorage.setItem('token', JSON.stringify(res.data));
                window.location.href = '/Dashboard';
            } else {
                console.log("no existe el usuario");

            }


        } catch (error) {
            console.error(error)
            alert('Error en el Inicio de Sesion')
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <div className="flex justify-center items-center w-full h-screen overflow-hidden">
            <div className="bg-white relative w-full h-full flex justify-center items-center">
                {/* Header y logo */}
                <div className="absolute top-0 w-full p-4 flex items-center space-x-2">
                    <img onClick={() => navigate('/')} src="/public/LogoCompleto.png" alt="logo"
                         className="w-50 h-20 cursor-pointer"/>
                </div>

                {/* SVG de ondas */}
                <svg className="absolute bottom-0 left-0 w-full text-red-600" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 1440 320">
                    <path
                        fill="currentColor"
                        fillOpacity="1"
                        d="M0,256L60,234.7C120,213,240,171,360,170.7C480,171,600,213,720,234.7C840,256,960,256,1080,245.3C1200,235,1320,213,1380,202.7L1440,192V320H1380C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320H0Z"
                    ></path>
                </svg>

                {/* Formulario de inicio de sesión */}
                <div className="relative z-10 mt-16 p-10 px-23 bg-white rounded-xl shadow-2xl border border-gray-300">
                    <img src="/public/LogoCompleto.png" alt="logo" className="w-full h-full"/>
                    <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
                        Inicio de Sesión
                    </h2>

                    {/* Usuario */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Correo
                        </label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className="w-full px-4 py-2 bor rounded-lg shadow-sm focus:rin focus:ring-red-600 focus:outline-n transition"
                               placeholder="Ingrese su correo"/>
                    </div>

                    {/* Contraseña */}
                    <div className="mb-4 relative">
                        <label className="block text-gray-700 font-semibold mb-1">
                            Contraseña
                        </label>
                        <input type={showPassword ? "text" : "password"} value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                               placeholder="Ingrese su contraseña"/>
                        <button type="button" onClick={togglePasswordVisibility}
                                className="absolute right-3 top-9 text-gray-500 hover:text-black mt-0.5">
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    {/* Botones de login */}
                    <button onClick={onLogin}
                            className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-red-500 transition cursor-pointer"
                    >
                        Iniciar Sesión
                    </button>

                    {/* Enlaces de ayuda */}
                    <div className="mt-4 text-sm text-center text-gray-600 flex justify-center space-x-2">
                        <p onClick={() => navigate("/Register")}
                           className="text-red-600 font-semibold hover:underline cursor-pointer"
                        >
                            ¿No tienes una cuenta?
                        </p>
                        <span>|</span>
                        <p className="text-red-600 font-semibold hover:underline cursor-pointer">
                            ¿Se te olvidó tu contraseña?
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login