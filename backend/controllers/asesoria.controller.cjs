const pool = require("../config/db.cjs");

exports.getMaterias = async (req, res) => {
    try {
        const result = await pool.query(`SELECT *
                                         from public.materia`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: "Error al obtener usuarios"});
    }
};

exports.crearAsesoria = async (req, res) => {
    const {
        idUsuario,
        materia,
        descripcion,
        precio_hora,
        precio_sesion,
        activa,
        hora_inicial,
        hora_final
    } = req.body;
    const activo = activa ? 'S' : 'N';
    try {

        // Validación de traslape de horario
        const conflicto = await pool.query(
            `SELECT 1
             FROM public.asesor_materia
             WHERE asesor_id = $1
               AND (
                 $2::time < hora_final
                 AND
                 $3::time > hora_inicial
                 )`,
            [idUsuario, hora_inicial, hora_final]
        );

        if (conflicto.rowCount > 0) {
            return res.status(201).json({
                success: false,
                mensaje: "El asesor ya tiene una asesoría en ese rango horario."
            });
        }


        await pool.query(
            "INSERT INTO public.asesor_materia(asesor_id,materia_id,descripcion,precio_hora,precio_sesion,activa,hora_inicial,hora_final) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
            [idUsuario, materia, descripcion, precio_hora, precio_sesion, activo, hora_inicial, hora_final
            ]
        );


        res.status(201).json({
            success: true,
            mensaje: "Asesoria registrada correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al registrar la asesoria"
        });
    }
};

exports.getAsesoria = async (req, res) => {
    try {
        const result = await pool.query(`SELECT a.id,
                                                a.asesor_id,
                                                a.materia_id,
                                                a.descripcion,
                                                a.precio_hora,
                                                a.precio_sesion,
                                                a.activa,
                                                a.hora_inicial,
                                                a.hora_final,
                                                b.nombre     materia,
                                                a.materia_id id_materia
                                         FROM public.asesor_materia a
                                                  inner join public.materia b on a.materia_id = b.id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: "Error al obtener comentarios"});
    }
};


exports.actualizarAsesoria = async (req, res) => {
    const {
        id,
        idUsuario,
        id_materia,
        materia,
        descripcion,
        precio_hora,
        precio_sesion,
        activa,
        hora_inicial,
        hora_final
    } = req.body;
    const activo = activa ? 'S' : 'N';
    try {

        // Validación de traslape de horario (excluyendo el mismo ID)
        const conflicto = await pool.query(
            `SELECT 1
             FROM public.asesor_materia
             WHERE asesor_id = $1
               AND id != $2
               AND ( $3:: time
                 < hora_final
               AND $4:: time
                 > hora_inicial
                 )`,
            [idUsuario, id, hora_inicial, hora_final]
        );

        if (conflicto.rowCount > 0) {
            return res.status(201).json({
                success: false,
                mensaje: "El asesor ya tiene una asesoría en ese rango horario."
            });
        }


        await pool.query(`UPDATE public.asesor_materia
                          SET asesor_id=$1,
                              materia_id=$2,
                              descripcion=$3,
                              precio_hora=$4,
                              precio_sesion=$5,
                              activa=$6,
                              hora_inicial=$7,
                              hora_final=$8
                          WHERE ID = $9;`,
            [idUsuario, id_materia, descripcion, precio_hora, precio_sesion, activo, hora_inicial, hora_final, id]
        );


        res.status(201).json({
            success: true,
            mensaje: "Asesoria registrada correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al registrar la asesoria"
        });
    }
};

exports.actualizarActivo = async (req, res) => {
    const {id, activo} = req.body;

    try {

        await pool.query(`UPDATE public.asesor_materia
                          SET activa=$1
                          WHERE ID = $2;`,
            [activo, id]
        );
        res.status(201).json({
            success: true,
            mensaje: "Estado actualizado."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al actualizar el estado"
        });
    }
};

exports.eliminarAsesoria = async (req, res) => {
    const {id} = req.body;

    try {

        await pool.query(`DELETE
                          FROM public.asesor_materia
                          WHERE ID =
                                $1;`, [id]
        );
        res.status(201).json({
            success: true,
            mensaje: "Asesoria registrada correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al registrar la asesoria"
        });
    }
};


exports.crearMateria = async (req, res) => {
    const {materia} = req.body;
    try {

        await pool.query("INSERT INTO public.materia(nombre) VALUES($1)", [materia]);


        res.status(201).json({
            success: true,
            mensaje: "Materia registrada correctamente."
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            sucess: false,
            mensaje: "Error al registrar la Materia"
        });
    }
};

exports.getAsesoresDisponibles = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT
                a.id,
                a.nombres,
                a.apellidos,
                a.email,
                a.telefono,
                a.carrera,
                COUNT(DISTINCT am.materia_id) as total_materias,
                STRING_AGG(DISTINCT m.nombre, ', ') as materias
            FROM public.asesor a
            LEFT JOIN public.asesor_materia am ON a.id = am.asesor_id
            LEFT JOIN public.materia m ON am.materia_id = m.id
            WHERE am.activa = 'S'
            GROUP BY a.id, a.nombres, a.apellidos, a.email, a.telefono, a.carrera
            ORDER BY a.nombres, a.apellidos
        `);
        res.json({ ok: true, asesores: result.rows });
    } catch (error) {
        console.error("Error al obtener asesores disponibles:", error);
        res.status(500).json({
            ok: false,
            error: "Error al obtener asesores disponibles"
        });
    }
};