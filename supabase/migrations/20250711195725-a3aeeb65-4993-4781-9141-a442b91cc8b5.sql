-- Crear política para permitir acceso público a alumnos a través de planillas compartibles
CREATE POLICY "Public access to alumnos through valid planilla token" 
ON public.alumnos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.planillas_compartibles pc 
    WHERE pc.curso_id = alumnos.curso_id
    AND pc.estado IN ('pendiente', 'completada')
  )
);