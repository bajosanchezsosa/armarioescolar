
-- Primero, eliminar la tabla de asistencias existente y recrearla con la nueva estructura
DROP TABLE IF EXISTS public.asistencias;

-- Crear nueva tabla de asistencias por materia
CREATE TABLE public.asistencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) NOT NULL,
  materia_id UUID REFERENCES public.materias(id) NOT NULL,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('P', 'A', 'T', 'J')) DEFAULT 'P',
  user_id UUID REFERENCES public.users(id) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(alumno_id, materia_id, fecha)
);

-- Habilitar Row Level Security
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para acceso completo de usuarios autenticados
CREATE POLICY "Usuarios autenticados acceso completo asistencias" ON public.asistencias FOR ALL USING (true);
