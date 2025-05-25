const pool = require("../config/db.cjs");

exports.getAsesores = async (req, res) => {
    try {
        const result = await pool.query(`SELECT b.nombre materia, c.nombres || ' ' || c.apellidos asesor, c.telefono
                                         FROM public.asesor_materia a
                                                  inner join public.materia b on a.materia_id = b.id
                                                  inner join public.asesor c on c.id = a.asesor_id`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: "Error al obtener usuarios"});
    }
};

exports.getComentarios = async (req, res) => {
    try {
        const result = await pool.query(`select a.contenido,
                                                a.fecha_creacion fecha,
                                                case
                                                    when a.rol = 'Asesor' then
                                                        b.nombres || ' ' || b.apellidos
                                                    else
                                                        c.nombres || ' ' || c.apellidos
                                                    end as       usuario
                                         from public.comentario a
                                                  left join public.asesor b on a.creado_por = b.id
                                                  left join public.estudiante c on a.creado_por = c.id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: "Error al obtener usuarios"});
    }
};

