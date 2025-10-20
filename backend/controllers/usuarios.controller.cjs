const pool = require("../config/db.cjs");

exports.getLogin = async (req, res) => {
    const {password, email} = req.body;
    console.log(password, email);

    try {
        const result = await pool.query(
            `
                SELECT *
                FROM (SELECT email, password, id, 'Asesor' rol, nombres, apellidos
                      FROM public.asesor
                      UNION
                      SELECT email, password, id, 'Estudiante' rol, nombres, apellidos
                      FROM public.estudiante) AS usuarios
                WHERE email = $1
                  AND password = $2
            `,
            [email, password]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({sucess: false, mensaje: "Error al obtener usuarios"});
    }
};

exports.crearUsuario = async (req, res) => {
    console.log("crear usuario", req.body)
    const {
        nombres,
        apellidos,
        codigo,
        roles,
        telefono,
        carrera,
        email,
        password,
    } = req.body;
    try {
        if (roles === "Asesor") {
            console.log("Insertando asesor...");
            await pool.query(
                "INSERT INTO public.asesor(nombres,apellidos,email,telefono,carrera,password) VALUES($1,$2,$3,$4,$5,$6)",
                [nombres, apellidos, email, telefono, carrera, password]
            );
        } else {
            await pool.query(
                "INSERT INTO public.estudiante(codigo_estudiante,nombres,apellidos,email,telefono,carrera,password) VALUES($1,$2,$3,$4,$5,$6,$7)",
                [codigo, nombres, apellidos, email, telefono, carrera, password]
            );
        }

        res.status(201).json({
            success: true,
            mensaje: "Usuario registrado correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al crear usuario, intente de nuevo."
        });
    }
};
