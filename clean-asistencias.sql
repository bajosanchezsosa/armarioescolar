-- Script para limpiar todos los registros de asistencia
-- EJECUTAR CON PRECAUCIÓN - ESTO BORRARÁ TODOS LOS DATOS DE ASISTENCIA

-- Borrar todos los registros de asistencia
DELETE FROM asistencias;

-- Verificar que se borraron todos los registros
SELECT COUNT(*) as total_asistencias FROM asistencias;

-- Opcional: Resetear la secuencia de IDs si existe
-- ALTER SEQUENCE asistencias_id_seq RESTART WITH 1; 