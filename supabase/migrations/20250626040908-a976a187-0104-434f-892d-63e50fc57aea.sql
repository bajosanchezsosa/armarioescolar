
-- Crear tabla para registrar el log de promociones
CREATE TABLE public.promociones_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID NOT NULL,
  curso_origen_id UUID NOT NULL,
  curso_destino_id UUID NOT NULL,
  user_id UUID NOT NULL,
  fecha_promocion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla de promociones_log
ALTER TABLE public.promociones_log ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios autenticados puedan ver todas las promociones
CREATE POLICY "Users can view all promotion logs" 
  ON public.promociones_log 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para que los usuarios autenticados puedan crear logs de promoción
CREATE POLICY "Users can create promotion logs" 
  ON public.promociones_log 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Añadir índices para optimizar consultas
CREATE INDEX idx_promociones_log_alumno_id ON public.promociones_log(alumno_id);
CREATE INDEX idx_promociones_log_fecha ON public.promociones_log(fecha_promocion);
CREATE INDEX idx_promociones_log_curso_origen ON public.promociones_log(curso_origen_id);
CREATE INDEX idx_promociones_log_curso_destino ON public.promociones_log(curso_destino_id);
