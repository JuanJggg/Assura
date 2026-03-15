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
    const id_conversacion = url.searchParams.get("id_conversacion");

    if (!id_conversacion) {
      return new Response(
        JSON.stringify({ error: "Falta parámetro: id_conversacion requerido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: mensajes, error } = await supabaseClient
      .from("chat_mensaje")
      .select("*")
      .eq("id_conversacion", id_conversacion)
      .order("fecha_envio", { ascending: true });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        mensajes: mensajes || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error al obtener mensajes:", err);
    return new Response(
      JSON.stringify({
        error: "Error al obtener mensajes",
        details: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
