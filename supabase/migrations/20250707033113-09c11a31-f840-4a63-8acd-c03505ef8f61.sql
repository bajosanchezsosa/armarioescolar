
-- Agregar la columna orientación a la tabla cursos
ALTER TABLE public.cursos 
ADD COLUMN orientacion TEXT NOT NULL DEFAULT 'ciclo básico'
CHECK (orientacion IN ('ciclo básico', 'multimedios', 'electromecánica', 'energías renovables', 'administración de las organizaciones'));

-- Modificar la restricción del turno para incluir vespertino
ALTER TABLE public.cursos 
DROP CONSTRAINT IF EXISTS cursos_turno_check;

ALTER TABLE public.cursos 
ADD CONSTRAINT cursos_turno_check 
CHECK (turno IN ('mañana', 'tarde', 'vespertino'));

-- Actualizar las políticas RLS para permitir modificaciones de cursos
DROP POLICY IF EXISTS "Authenticated users can view cursos" ON public.cursos;

CREATE POLICY "Authenticated users can manage cursos" 
ON public.cursos 
FOR ALL 
USING (true);
