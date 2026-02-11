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

    const { chatId, content, senderId } = await req.json();

    if (!chatId || !content || !senderId) {
      return new Response(
        JSON.stringify({
          error: "Faltan datos requeridos",
          required: ["chatId", "content", "senderId"],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: mensajeGuardado, error: mensajeError } = await supabaseClient
      .from("chat_mensaje")
      .insert({
        id_conversacion: chatId,
        contenido: content,
        id_usuario: senderId,
        fecha_envio: new Date().toISOString(),
      })
      .select()
      .single();

    if (mensajeError) throw mensajeError;

    const { error: updateError } = await supabaseClient
      .from("chats_conversacion")
      .update({ ultima_actividad: new Date().toISOString() })
      .eq("id", chatId);

    if (updateError) throw updateError;

    const { data: conversacion, error: convError } = await supabaseClient
      .from("chats_conversacion")
      .select("id_estudiante, id_asesor")
      .eq("id", chatId)
      .single();

    if (convError) throw convError;

    if (!conversacion) {
      return new Response(
        JSON.stringify({ error: "Conversación no encontrada" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { id_estudiante, id_asesor } = conversacion;
    const receptorId = senderId == id_estudiante ? id_asesor : id_estudiante;

    const { error: notifError } = await supabaseClient
      .from("chats_notificacion")
      .upsert(
        {
          id_conversacion: chatId,
          id_receptor: receptorId,
          leido: false,
          fecha_creacion: new Date().toISOString(),
        },
        {
          onConflict: "id_conversacion,id_receptor",
        }
      );

    if (notifError) console.error("Error al crear notificación:", notifError);

    await pusher.trigger(`chat-${chatId}`, "nuevo-mensaje", {
      id: mensajeGuardado.id,
      id_conversacion: chatId,
      contenido: content,
      id_usuario: senderId,
      fecha_envio: mensajeGuardado.fecha_envio,
    });

    const esAsesor = senderId == id_asesor;
    const canalReceptor = esAsesor
      ? `estudiante-${id_estudiante}`
      : `asesor-${id_asesor}`;

    await pusher.trigger(canalReceptor, "nuevo-mensaje-notificacion", {
      id_conversacion: chatId,
      mensaje: content,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: mensajeGuardado,
        message: "Mensaje enviado exitosamente",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
    return new Response(
      JSON.stringify({
        error: "Error al enviar mensaje",
        details: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
