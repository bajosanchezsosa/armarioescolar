-- Script para verificar los datos de asistencia actuales
-- Ejecutar antes de borrar para hacer backup

-- Ver total de registros
SELECT COUNT(*) as total_asistencias FROM asistencias;

-- Ver asistencias por fecha
SELECT fecha, COUNT(*) as total_por_fecha 
FROM asistencias 
GROUP BY fecha 
ORDER BY fecha;

-- Ver asistencias por alumno
SELECT a.alumno_id, al.nombre, al.apellido, COUNT(*) as total_asistencias
FROM asistencias a
JOIN alumnos al ON a.alumno_id = al.id
GROUP BY a.alumno_id, al.nombre, al.apellido
ORDER BY al.apellido, al.nombre;

-- Ver asistencias por estado
SELECT estado, COUNT(*) as total_por_estado
FROM asistencias
GROUP BY estado;

-- Ver asistencias específicas de MAZA
SELECT a.*, al.nombre, al.apellido, m.nombre as materia_nombre
FROM asistencias a
JOIN alumnos al ON a.alumno_id = al.id
JOIN materias m ON a.materia_id = m.id
WHERE al.apellido LIKE '%MAZA%' OR al.nombre LIKE '%MAZA%'
ORDER BY a.fecha, m.nombre; 