
-- Crear tabla para el log de asistencias
CREATE TABLE public.asistencias_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL,
  materia_id UUID NOT NULL,
  fecha DATE NOT NULL,
  user_id UUID NOT NULL,
  user_nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar índices para mejorar el rendimiento
CREATE INDEX idx_asistencias_log_curso_materia_fecha 
ON public.asistencias_log (curso_id, materia_id, fecha);

-- Habilitar RLS
ALTER TABLE public.asistencias_log ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver y crear logs
CREATE POLICY "Users can view and create attendance logs" 
ON public.asistencias_log 
FOR ALL 
USING (true) 
WITH CHECK (true);
