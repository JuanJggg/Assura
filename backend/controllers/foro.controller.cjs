const pool = require("../config/db.cjs");

exports.getForos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT a.id_foro        id,
                                                a.titulo,
                                                a.descripcion,
                                                a.fecha_creacion fecha,
                                                CASE
                                                    WHEN a.rol = 'Asesor' THEN c.nombres || ' ' || c.apellidos
                                                    ELSE b.nombres || ' ' || b.apellidos
                                                    END AS       creado_por,
                                                count(d.*)       comentarios
                                         FROM public.foro a
                                                  left join public.estudiante b on a.creado_por = b.id
                                                  left join public.asesor c on a.creado_por = c.id
                                                  left join public.comentario d on d.id_foro = a.id_foro
                                         group by a.id_foro, a.titulo, a.descripcion, a.fecha_creacion, c.nombres,
                                                  b.nombres, c.apellidos, b.apellidos
                                         order by a.fecha_creacion`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({sucess: false, mensaje: "Error al obtener usuarios"});
    }
};

exports.crearForo = async (req, res) => {
    const {title, description, id, rol} = req.body;
    const fecha_actual = new Date();
    try {

        await pool.query(
            "INSERT INTO public.foro(titulo,descripcion,creado_por,rol,fecha_creacion) VALUES($1,$2,$3,$4,$5)",
            [title, description, id, rol, fecha_actual]
        );


        res.status(201).json({
            success: true,
            mensaje: "Foro registrado correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al registrar el foro"
        });
    }
};

exports.getComentario = async (req, res) => {
    try {
        const result = await pool.query(`SELECT a.id_come        id,
                                                a.id_foro,
                                                a.contenido,
                                                a.fecha_creacion fecha,
                                                CASE
                                                    WHEN a.rol = 'Asesor' THEN c.nombres || ' ' || c.apellidos
                                                    ELSE b.nombres || ' ' || b.apellidos
                                                    END AS       creado_por
                                         FROM public.comentario a
                                                  left join public.estudiante b on a.creado_por = b.id
                                                  left join public.asesor c on a.creado_por = c.id
                                         order by a.fecha_creacion`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({sucess: false, mensaje: "Error al obtener comentarios"});
    }
};


exports.crearComentario = async (req, res) => {
    console.log("crear usuario", req.body)
    const {idForo, comentario, id, rol} = req.body;
    const fecha_actual = new Date();
    try {

        await pool.query(
            "INSERT INTO public.comentario(id_foro,contenido,creado_por,rol,fecha_creacion) VALUES($1,$2,$3,$4,$5)",
            [idForo, comentario, id, rol, fecha_actual]
        );


        res.status(201).json({
            success: true,
            mensaje: "Comentario registrado correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            mensaje: "Error al registrar el comentario"
        });
    }
};