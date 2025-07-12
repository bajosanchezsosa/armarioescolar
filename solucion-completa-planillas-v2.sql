-- Script completo para solucionar todos los problemas de planillas (versión 2)
-- Ejecutar en Supabase SQL Editor

-- 1. ELIMINAR TODOS LOS TRIGGERS QUE DEPENDEN DE LA FUNCIÓN
DROP TRIGGER IF EXISTS update_notas_updated_at ON notas;
DROP TRIGGER IF EXISTS update_actas_updated_at ON actas;
DROP TRIGGER IF EXISTS update_periodos_notas_updated_at ON periodos_notas;
DROP TRIGGER IF EXISTS update_planillas_compartibles_updated_at ON planillas_compartibles;
DROP TRIGGER IF EXISTS update_calificaciones_finales_updated_at ON calificaciones_finales;
DROP TRIGGER IF EXISTS update_materias_pendientes_updated_at ON materias_pendientes;

-- 2. ELIMINAR LA FUNCIÓN INCORRECTA
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. CREAR LA FUNCIÓN CORRECTA QUE ACTUALIZA updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. RECREAR TODOS LOS TRIGGERS
CREATE TRIGGER update_notas_updated_at 
BEFORE UPDATE ON notas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actas_updated_at 
BEFORE UPDATE ON actas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_periodos_notas_updated_at 
BEFORE UPDATE ON periodos_notas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planillas_compartibles_updated_at 
BEFORE UPDATE ON planillas_compartibles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calificaciones_finales_updated_at 
BEFORE UPDATE ON calificaciones_finales 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materias_pendientes_updated_at 
BEFORE UPDATE ON materias_pendientes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. ACTUALIZAR TIPOS DE EVALUACIÓN EN NOTAS
-- Eliminar la restricción existente
ALTER TABLE notas DROP CONSTRAINT IF EXISTS notas_tipo_evaluacion_check;

-- Agregar la nueva restricción incluyendo 'PRE' a la lista existente
ALTER TABLE notas ADD CONSTRAINT notas_tipo_evaluacion_check 
CHECK (tipo_evaluacion = ANY (ARRAY['Parcial', 'Trimestral', 'Oral', 'Trabajo Práctico', 'Taller', 'EF', 'Nota Final', 'PRE']));

-- 6. ACTUALIZAR ESTADOS DE PLANILLAS COMPARTIBLES
-- Eliminar la restricción existente
ALTER TABLE planillas_compartibles DROP CONSTRAINT IF EXISTS planillas_compartibles_estado_check;

-- Agregar la nueva restricción con todos los estados permitidos
ALTER TABLE planillas_compartibles ADD CONSTRAINT planillas_compartibles_estado_check 
CHECK (estado IN ('pendiente', 'completada', 'enviada_final'));

-- 7. VERIFICAR LOS CAMBIOS REALIZADOS
SELECT 'FUNCIÓN CORREGIDA' as consulta;
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_updated_at_column';

SELECT 'TRIGGERS RECREADOS' as consulta;
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE 'update_%_updated_at'
ORDER BY trigger_name;

SELECT 'TIPOS DE EVALUACIÓN ACTUALIZADOS' as consulta;
SELECT DISTINCT tipo_evaluacion FROM notas ORDER BY tipo_evaluacion;

SELECT 'ESTADOS DE PLANILLAS ACTUALIZADOS' as consulta;
SELECT DISTINCT estado FROM planillas_compartibles ORDER BY estado;

-- 8. MOSTRAR RESUMEN DE CAMBIOS
SELECT 'RESUMEN DE CAMBIOS' as consulta;
SELECT 
    'Función update_updated_at_column corregida' as descripcion,
    'Ahora actualiza updated_at en lugar de actualizado_en' as valores
UNION ALL
SELECT 
    'Triggers recreados' as descripcion,
    'Todos los triggers ahora usan la función corregida' as valores
UNION ALL
SELECT 
    'Tipos de evaluación disponibles:' as descripcion,
    'Parcial, Trimestral, Oral, Trabajo Práctico, Taller, EF, Nota Final, PRE' as valores
UNION ALL
SELECT 
    'Estados de planillas permitidos:' as descripcion,
    'pendiente, completada, enviada_final' as valores; 