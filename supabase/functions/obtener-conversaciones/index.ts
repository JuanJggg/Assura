import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const url = new URL(req.url);
    const tipo = url.searchParams.get("tipo");
    const id = url.searchParams.get("id");

    if (!tipo || !id) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: tipo e id requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let conversaciones = [];

    if (tipo === "estudiante") {
      const { data, error } = await supabaseClient
        .from("chats_conversacion")
        .select(`
          *,
          asesor:id_asesor (
            id,
            nombres,
            apellidos,
            telefono
          ),
          mensajes:chat_mensaje(contenido, fecha_envio)
        `)
        .eq("id_estudiante", id)
        .order("ultima_actividad", { ascending: false });

      if (error) throw error;

      conversaciones = data.map((conv: any) => ({
        ...conv,
        asesor_nombre: conv.asesor?.nombres,
        asesor_apellido: conv.asesor?.apellidos,
        asesor_telefono: conv.asesor?.telefono,
        asesor_materia: "",
        ultimo_mensaje: conv.mensajes?.[0]?.contenido || null,
      }));
    } else {
      const { data, error } = await supabaseClient
        .from("chats_conversacion")
        .select(`
          *,
          estudiante:id_estudiante (
            id,
            nombres,
            apellidos
          ),
          mensajes:chat_mensaje(contenido, fecha_envio)
        `)
        .eq("id_asesor", id)
        .order("ultima_actividad", { ascending: false });

      if (error) throw error;

      conversaciones = data.map((conv: any) => ({
        ...conv,
        estudiante_nombre: conv.estudiante?.nombres,
        estudiante_apellido: conv.estudiante?.apellidos,
        ultimo_mensaje: conv.mensajes?.[0]?.contenido || null,
      }));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        conversaciones,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error al obtener conversaciones:", err);
    return new Response(
      JSON.stringify({
        error: "Error al obtener conversaciones",
        details: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
