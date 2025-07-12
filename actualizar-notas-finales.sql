-- Script para actualizar tipos de evaluación y agregar período "Nota Final"
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar los tipos de evaluación existentes en la tabla notas
-- Cambiar 'Educación Física' por 'EF' para mantener consistencia
UPDATE notas 
SET tipo_evaluacion = 'EF' 
WHERE tipo_evaluacion = 'Educación Física';

-- 2. Agregar el nuevo tipo 'Nota Final' a la restricción CHECK
-- Primero necesitamos eliminar la restricción existente
ALTER TABLE notas DROP CONSTRAINT IF EXISTS notas_tipo_evaluacion_check;

-- Luego agregar la nueva restricción con todos los tipos
ALTER TABLE notas ADD CONSTRAINT notas_tipo_evaluacion_check 
CHECK (tipo_evaluacion = ANY (ARRAY['Parcial', 'Trimestral', 'Oral', 'Trabajo Práctico', 'Taller', 'EF', 'Nota Final']));

-- 3. Agregar el período "Nota Final" para todos los cursos activos
INSERT INTO periodos_notas (curso_id, nombre, descripcion, fecha_inicio, fecha_fin, activo)
SELECT 
    c.id as curso_id,
    'Nota Final' as nombre,
    'Período para calificaciones finales del año lectivo' as descripcion,
    '2024-12-01' as fecha_inicio,
    '2024-12-31' as fecha_fin,
    true as activo
FROM cursos c
WHERE c.activo = true
AND NOT EXISTS (
    SELECT 1 FROM periodos_notas pn 
    WHERE pn.curso_id = c.id 
    AND pn.nombre = 'Nota Final'
);

-- 4. Verificar los cambios realizados
SELECT 'TIPOS DE EVALUACIÓN ACTUALIZADOS' as consulta;
SELECT DISTINCT tipo_evaluacion FROM notas ORDER BY tipo_evaluacion;

SELECT 'PERÍODOS AGREGADOS' as consulta;
SELECT 
    c.anio,
    c.division,
    pn.nombre,
    pn.descripcion,
    pn.activo
FROM periodos_notas pn
JOIN cursos c ON pn.curso_id = c.id
WHERE pn.nombre = 'Nota Final'
ORDER BY c.anio, c.division;

-- 5. Mostrar resumen de cambios
SELECT 'RESUMEN DE CAMBIOS' as consulta;
SELECT 
    'Tipos de evaluación disponibles:' as descripcion,
    'Parcial, Trimestral, Oral, Trabajo Práctico, Taller, EF, Nota Final' as valores; 