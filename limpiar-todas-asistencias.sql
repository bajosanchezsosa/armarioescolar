-- ELIMINAR TODOS LOS REGISTROS DE ASISTENCIA
-- ⚠️ ADVERTENCIA: Este script elimina TODAS las asistencias de TODOS los cursos
-- Ejecutar solo si estás seguro de querer empezar de cero

-- Eliminar todas las asistencias
DELETE FROM public.asistencias;

-- Opcional: Resetear los IDs de la secuencia (si usas auto-increment)
-- ALTER SEQUENCE public.asistencias_id_seq RESTART WITH 1;

-- Verificar que se eliminaron todos los registros
SELECT COUNT(*) as total_asistencias_restantes FROM public.asistencias;

-- Mensaje de confirmación
SELECT 'Todas las asistencias han sido eliminadas. Puedes empezar de cero.' as mensaje; 