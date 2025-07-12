
-- Modificar la tabla de actas para soportar múltiples alumnos y diferentes tipos
DROP TABLE IF EXISTS public.actas;

-- Crear tabla de actas mejorada
CREATE TABLE public.actas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) NOT NULL,
  fecha DATE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('curso', 'alumno', 'salud', 'accidente', 'disciplinario', 'otro')) DEFAULT 'otro',
  prioridad TEXT NOT NULL CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')) DEFAULT 'media',
  user_id UUID REFERENCES public.users(id) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla intermedia para relacionar actas con alumnos (muchos a muchos)
CREATE TABLE public.acta_alumnos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acta_id UUID REFERENCES public.actas(id) ON DELETE CASCADE NOT NULL,
  alumno_id UUID REFERENCES public.alumnos(id) NOT NULL,
  UNIQUE(acta_id, alumno_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.actas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acta_alumnos ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para acceso completo de usuarios autenticados
CREATE POLICY "Usuarios autenticados acceso completo actas" ON public.actas FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo acta_alumnos" ON public.acta_alumnos FOR ALL USING (true);

-- Crear trigger para actualizar timestamp de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_actas_updated_at BEFORE UPDATE ON public.actas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
