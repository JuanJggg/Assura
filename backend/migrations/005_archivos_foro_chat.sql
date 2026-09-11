-- Migración: Soporte de archivos en Foro y Chat
-- Ejecutar en la base de datos PostgreSQL

-- Foro: campo para múltiples archivos (array de URLs)
ALTER TABLE public.foro ADD COLUMN IF NOT EXISTS archivos TEXT[];

-- Comentarios del foro: campo para un archivo
ALTER TABLE public.comentario ADD COLUMN IF NOT EXISTS archivo_url TEXT;

-- Chat: tipo de contenido y URL del archivo
ALTER TABLE public.chat_mensaje ADD COLUMN IF NOT EXISTS tipo_contenido VARCHAR(20) DEFAULT 'texto';
ALTER TABLE public.chat_mensaje ADD COLUMN IF NOT EXISTS archivo_url TEXT;
