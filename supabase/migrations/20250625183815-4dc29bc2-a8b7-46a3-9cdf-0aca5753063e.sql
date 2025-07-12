
-- Crear tabla de notas con la estructura correcta
DROP TABLE IF EXISTS public.notas CASCADE;

CREATE TABLE public.notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID NOT NULL,
  materia_id UUID NOT NULL,
  curso_id UUID NOT NULL,
  tipo_evaluacion TEXT NOT NULL CHECK (tipo_evaluacion IN ('Parcial', 'Trimestral', 'Oral', 'Trabajo Práctico', 'Taller', 'Educación Física')),
  nota NUMERIC(3,1) CHECK (nota >= 1 AND nota <= 10),
  fecha DATE NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar foreign keys
ALTER TABLE public.notas
ADD CONSTRAINT fk_notas_alumno 
FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id) ON DELETE CASCADE;

ALTER TABLE public.notas
ADD CONSTRAINT fk_notas_materia 
FOREIGN KEY (materia_id) REFERENCES public.materias(id) ON DELETE CASCADE;

ALTER TABLE public.notas
ADD CONSTRAINT fk_notas_curso 
FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notas_updated_at 
BEFORE UPDATE ON public.notas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Authenticated users can manage notas" ON public.notas
FOR ALL TO authenticated USING (true);
