-- Script para debug del problema con MAZA
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar materias del curso 5°2
SELECT 'MATERIAS DEL CURSO 5°2' as consulta;
SELECT m.id, m.nombre, m.tipo, c.anio, c.division 
FROM materias m 
JOIN cursos c ON m.curso_id = c.id 
WHERE c.anio = 5 AND c.division = 2
ORDER BY m.nombre;

-- 2. Verificar si el alumno MAZA existe
SELECT 'ALUMNO MAZA' as consulta;
SELECT id, nombre, apellido, activo, curso_id, grupo_taller
FROM alumnos 
WHERE apellido LIKE '%MAZA%' OR nombre LIKE '%MAZA%';

-- 3. Verificar todos los alumnos del curso 5°2
SELECT 'ALUMNOS DEL CURSO 5°2' as consulta;
SELECT id, nombre, apellido, activo, grupo_taller
FROM alumnos al
JOIN cursos c ON al.curso_id = c.id
WHERE c.anio = 5 AND c.division = 2 AND al.activo = true
ORDER BY al.apellido, al.nombre;

-- 4. Verificar asistencias del alumno MAZA
SELECT 'ASISTENCIAS DEL ALUMNO MAZA' as consulta;
SELECT a.id, a.fecha, a.estado, m.nombre as materia_nombre, m.tipo as materia_tipo
FROM asistencias a 
JOIN alumnos al ON a.alumno_id = al.id 
JOIN materias m ON a.materia_id = m.id 
WHERE al.apellido LIKE '%MAZA%' OR al.nombre LIKE '%MAZA%'
ORDER BY a.fecha, m.nombre;

-- 5. Verificar todas las asistencias del curso 5°2 para julio 2025
SELECT 'ASISTENCIAS DEL CURSO 5°2 EN JULIO 2025' as consulta;
SELECT a.fecha, COUNT(*) as total_asistencias
FROM asistencias a
JOIN alumnos al ON a.alumno_id = al.id
JOIN materias m ON a.materia_id = m.id
JOIN cursos c ON m.curso_id = c.id
WHERE c.anio = 5 AND c.division = 2 
  AND a.fecha >= '2025-07-01' AND a.fecha <= '2025-07-31'
GROUP BY a.fecha
ORDER BY a.fecha;

-- 6. Verificar asistencias por alumno en julio 2025
SELECT 'ASISTENCIAS POR ALUMNO EN JULIO 2025' as consulta;
SELECT al.apellido, al.nombre, COUNT(*) as total_asistencias
FROM asistencias a
JOIN alumnos al ON a.alumno_id = al.id
JOIN materias m ON a.materia_id = m.id
JOIN cursos c ON m.curso_id = c.id
WHERE c.anio = 5 AND c.division = 2 
  AND a.fecha >= '2025-07-01' AND a.fecha <= '2025-07-31'
GROUP BY al.id, al.apellido, al.nombre
ORDER BY al.apellido, al.nombre; 