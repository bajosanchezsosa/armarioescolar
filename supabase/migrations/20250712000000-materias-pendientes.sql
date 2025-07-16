-- Crear tabla de materias pendientes
CREATE TABLE IF NOT EXISTS public.materias_pendientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
  materia_original_id UUID REFERENCES public.materias(id) ON DELETE SET NULL,
  vinculada_con_materia_id UUID REFERENCES public.materias(id) ON DELETE SET NULL,
  anio_origen INTEGER NOT NULL CHECK (anio_origen >= 1 AND anio_origen <= 7),
  estado TEXT CHECK (estado IN ('pendiente', 'en_curso', 'aprobada')) DEFAULT 'pendiente',
  observaciones TEXT,
  creado_por_id UUID REFERENCES public.users(id),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.materias_pendientes ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Authenticated users can manage materias_pendientes" ON public.materias_pendientes
FOR ALL TO authenticated USING (true);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_materias_pendientes_updated_at 
BEFORE UPDATE ON public.materias_pendientes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_materias_pendientes_alumno_id ON public.materias_pendientes(alumno_id);
CREATE INDEX IF NOT EXISTS idx_materias_pendientes_materia_original_id ON public.materias_pendientes(materia_original_id);
CREATE INDEX IF NOT EXISTS idx_materias_pendientes_vinculada_con_materia_id ON public.materias_pendientes(vinculada_con_materia_id);
CREATE INDEX IF NOT EXISTS idx_materias_pendientes_estado ON public.materias_pendientes(estado); 

ALTER TABLE asistencias
ADD CONSTRAINT asistencia_unica UNIQUE (alumno_id, materia_id, fecha); 