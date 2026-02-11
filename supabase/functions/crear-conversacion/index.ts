import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Pusher from "npm:pusher@5.2.0";

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

    const pusher = new Pusher({
      appId: "2113838",
      key: "76e3f9405cf16a0f3709",
      secret: "1ebdeeb04f6ea168a6da",
      cluster: "mt1",
      useTLS: true,
    });

    const { id_estudiante, id_asesor, idUsuario, idAsesor } = await req.json();

    const estudianteId = id_estudiante || idUsuario;
    const asesorId = id_asesor || idAsesor;

    console.log("Crear conversacion entre estudiante", estudianteId, "y asesor", asesorId);

    const { data: existing, error: existingError } = await supabaseClient
      .from("chats_conversacion")
      .select(`
        *,
        asesor:id_asesor (
          id,
          nombres,
          apellidos,
          telefono
        )
      `)
      .eq("id_estudiante", estudianteId)
      .eq("id_asesor", asesorId)
      .single();

    if (existing) {
      console.log("Conversación existente encontrada:", existing);
      return new Response(
        JSON.stringify({
          ok: true,
          conversacion: {
            ...existing,
            asesor_nombre: existing.asesor?.nombres,
            asesor_apellido: existing.asesor?.apellidos,
            asesor_telefono: existing.asesor?.telefono,
            asesor_materia: "",
          },
          nuevo: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: newConv, error: insertError } = await supabaseClient
      .from("chats_conversacion")
      .insert({
        id_estudiante: estudianteId,
        id_asesor: asesorId,
        ultima_actividad: new Date().toISOString(),
      })
      .select(`
        *,
        asesor:id_asesor (
          id,
          nombres,
          apellidos,
          telefono
        )
      `)
      .single();

    if (insertError) throw insertError;

    console.log("Nueva conversación creada:", newConv);

    const conversacionCompleta = {
      ...newConv,
      asesor_nombre: newConv.asesor?.nombres,
      asesor_apellido: newConv.asesor?.apellidos,
      asesor_telefono: newConv.asesor?.telefono,
      asesor_materia: "",
    };

    await pusher.trigger(`asesor-${asesorId}`, "nueva-conversacion", {
      conversacion: conversacionCompleta,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        conversacion: conversacionCompleta,
        nuevo: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error al crear conversacion:", err);
    return new Response(
      JSON.stringify({
        error: "Error al crear conversacion",
        details: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
