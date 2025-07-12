
-- Crear tabla de períodos de notas
CREATE TABLE public.periodos_notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de planillas compartibles
CREATE TABLE public.planillas_compartibles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id UUID REFERENCES public.periodos_notas(id) ON DELETE CASCADE NOT NULL,
  materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  token_url TEXT NOT NULL UNIQUE,
  profesor_nombre TEXT,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modificar tabla de notas: primero agregar la nueva columna para período
ALTER TABLE public.notas 
ADD COLUMN periodo_id UUID REFERENCES public.periodos_notas(id) ON DELETE SET NULL;

-- Cambiar el tipo de la columna nota de numeric a text
-- Primero crear una nueva columna temporal
ALTER TABLE public.notas ADD COLUMN nota_temp TEXT;

-- Copiar los datos existentes convirtiendo numeric a text
UPDATE public.notas SET nota_temp = CASE 
  WHEN nota IS NULL THEN NULL 
  ELSE nota::text 
END;

-- Eliminar la columna antigua
ALTER TABLE public.notas DROP COLUMN nota;

-- Renombrar la columna temporal
ALTER TABLE public.notas RENAME COLUMN nota_temp TO nota;

-- Habilitar RLS
ALTER TABLE public.periodos_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planillas_compartibles ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Authenticated users can manage periodos_notas" ON public.periodos_notas
FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage planillas_compartibles" ON public.planillas_compartibles
FOR ALL TO authenticated USING (true);

-- Política especial para acceso público a planillas por token
CREATE POLICY "Public access to planillas by token" ON public.planillas_compartibles
FOR SELECT TO anon USING (true);

CREATE POLICY "Public update planillas by token" ON public.planillas_compartibles
FOR UPDATE TO anon USING (true);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_periodos_notas_updated_at 
BEFORE UPDATE ON public.periodos_notas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planillas_compartibles_updated_at 
BEFORE UPDATE ON public.planillas_compartibles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar períodos predeterminados para cursos existentes
INSERT INTO public.periodos_notas (curso_id, nombre, descripcion)
SELECT 
  id,
  'Pre-notas 1er Cuatrimestre',
  'Período de pre-notas del primer cuatrimestre'
FROM public.cursos WHERE activo = true;

INSERT INTO public.periodos_notas (curso_id, nombre, descripcion)
SELECT 
  id,
  'Notas 1er Cuatrimestre',
  'Período de notas definitivas del primer cuatrimestre'
FROM public.cursos WHERE activo = true;

INSERT INTO public.periodos_notas (curso_id, nombre, descripcion)
SELECT 
  id,
  'Pre-notas 2do Cuatrimestre',
  'Período de pre-notas del segundo cuatrimestre'
FROM public.cursos WHERE activo = true;

INSERT INTO public.periodos_notas (curso_id, nombre, descripcion)
SELECT 
  id,
  'Notas 2do Cuatrimestre',
  'Período de notas definitivas del segundo cuatrimestre'
FROM public.cursos WHERE activo = true;
