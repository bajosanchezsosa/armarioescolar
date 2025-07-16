-- SCRIPT DE DEBUG PARA REGISTRO GENERAL
-- Ejecutar para ver qué datos están en la base de datos

-- 1. Verificar cursos disponibles
SELECT 'CURSOS DISPONIBLES:' as seccion;
SELECT id, anio, division, turno, orientacion, activo 
FROM public.cursos 
WHERE activo = true 
ORDER BY anio, division;

-- 2. Verificar alumnos por curso
SELECT 'ALUMNOS POR CURSO:' as seccion;
SELECT 
  c.anio || '°' || c.division || ' ' || c.turno as curso,
  COUNT(a.id) as total_alumnos,
  COUNT(CASE WHEN a.grupo_taller = 'A' THEN 1 END) as grupo_a,
  COUNT(CASE WHEN a.grupo_taller = 'B' THEN 1 END) as grupo_b
FROM public.cursos c
LEFT JOIN public.alumnos a ON c.id = a.curso_id AND a.activo = true
WHERE c.activo = true
GROUP BY c.id, c.anio, c.division, c.turno
ORDER BY c.anio, c.division;

-- 3. Verificar materias por curso
SELECT 'MATERIAS POR CURSO:' as seccion;
SELECT 
  c.anio || '°' || c.division || ' ' || c.turno as curso,
  m.nombre,
  m.tipo,
  m.profesor,
  COUNT(mm.id) as total_modulos
FROM public.cursos c
JOIN public.materias m ON c.id = m.curso_id
LEFT JOIN public.materia_modulos mm ON m.id = mm.materia_id
WHERE c.activo = true
GROUP BY c.id, c.anio, c.division, c.turno, m.id, m.nombre, m.tipo, m.profesor
ORDER BY c.anio, c.division, m.nombre;

-- 4. Verificar módulos de materias
SELECT 'MÓDULOS DE MATERIAS:' as seccion;
SELECT 
  m.nombre as materia,
  m.tipo,
  mm.dia_semana,
  CASE mm.dia_semana 
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes' 
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
    WHEN 7 THEN 'Domingo'
    ELSE 'Desconocido'
  END as dia_nombre,
  mm.hora_inicio,
  mm.cantidad_modulos,
  mm.grupo
FROM public.materias m
JOIN public.materia_modulos mm ON m.id = mm.materia_id
ORDER BY m.nombre, mm.dia_semana, mm.hora_inicio;

-- 5. Verificar asistencias del último mes
SELECT 'ASISTENCIAS DEL ÚLTIMO MES:' as seccion;
SELECT 
  a.fecha,
  c.anio || '°' || c.division as curso,
  al.apellido || ', ' || al.nombre as alumno,
  al.grupo_taller,
  m.nombre as materia,
  m.tipo,
  a.estado,
  COUNT(*) as cantidad
FROM public.asistencias a
JOIN public.alumnos al ON a.alumno_id = al.id
JOIN public.materias m ON a.materia_id = m.id
JOIN public.cursos c ON al.curso_id = c.id
WHERE a.fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY a.fecha, c.anio, c.division, al.apellido, al.nombre, al.grupo_taller, m.nombre, m.tipo, a.estado
ORDER BY a.fecha DESC, curso, alumno;

-- 6. Resumen de asistencias por fecha
SELECT 'RESUMEN DE ASISTENCIAS POR FECHA:' as seccion;
SELECT 
  a.fecha,
  COUNT(DISTINCT a.alumno_id) as alumnos_con_asistencia,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN a.estado = 'P' THEN 1 END) as presentes,
  COUNT(CASE WHEN a.estado = 'A' THEN 1 END) as ausentes,
  COUNT(CASE WHEN a.estado = 'T' THEN 1 END) as tardanzas,
  COUNT(CASE WHEN a.estado = 'J' THEN 1 END) as justificadas
FROM public.asistencias a
WHERE a.fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY a.fecha
ORDER BY a.fecha DESC;

-- 7. Verificar si hay asistencias duplicadas
SELECT 'ASISTENCIAS DUPLICADAS:' as seccion;
SELECT 
  a.alumno_id,
  a.materia_id,
  a.fecha,
  COUNT(*) as cantidad_duplicados
FROM public.asistencias a
GROUP BY a.alumno_id, a.materia_id, a.fecha
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC; 