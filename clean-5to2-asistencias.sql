-- Script para borrar todas las asistencias del curso 5°2
-- EJECUTAR CON PRECAUCIÓN - ESTO BORRARÁ TODOS LOS DATOS DE ASISTENCIA DEL CURSO

-- Primero, ver cuántas asistencias hay del curso 5°2
SELECT COUNT(*) as total_asistencias_5to2
FROM asistencias a
JOIN alumnos al ON a.alumno_id = al.id
JOIN materias m ON a.materia_id = m.id
JOIN cursos c ON m.curso_id = c.id
WHERE c.anio = 5 AND c.division = 2;

-- Ver las asistencias que se van a borrar (última verificación)
SELECT 
  a.id,
  a.fecha,
  a.estado,
  al.apellido,
  al.nombre,
  m.nombre as materia,
  c.anio,
  c.division
FROM asistencias a
JOIN alumnos al ON a.alumno_id = al.id
JOIN materias m ON a.materia_id = m.id
JOIN cursos c ON m.curso_id = c.id
WHERE c.anio = 5 AND c.division = 2
ORDER BY a.fecha, al.apellido, m.nombre;

-- BORRAR todas las asistencias del curso 5°2
DELETE FROM asistencias 
WHERE materia_id IN (
  SELECT m.id 
  FROM materias m
  JOIN cursos c ON m.curso_id = c.id
  WHERE c.anio = 5 AND c.division = 2
);

-- Verificar que se borraron todas
SELECT COUNT(*) as asistencias_restantes_5to2
FROM asistencias a
JOIN materias m ON a.materia_id = m.id
JOIN cursos c ON m.curso_id = c.id
WHERE c.anio = 5 AND c.division = 2; 