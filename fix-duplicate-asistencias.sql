-- Script para eliminar registros duplicados de asistencia
-- Mantiene solo el registro más reciente para cada combinación de alumno, materia y fecha

-- Primero, ver cuántos duplicados hay
WITH duplicates AS (
  SELECT 
    alumno_id, 
    materia_id, 
    fecha,
    COUNT(*) as total_registros
  FROM asistencias
  GROUP BY alumno_id, materia_id, fecha
  HAVING COUNT(*) > 1
)
SELECT COUNT(*) as total_duplicados FROM duplicates;

-- Ver los duplicados específicos
WITH duplicates AS (
  SELECT 
    a.*,
    ROW_NUMBER() OVER (
      PARTITION BY alumno_id, materia_id, fecha 
      ORDER BY creado_en DESC
    ) as rn
  FROM asistencias a
)
SELECT 
  d.*,
  al.nombre,
  al.apellido,
  m.nombre as materia_nombre
FROM duplicates d
JOIN alumnos al ON d.alumno_id = al.id
JOIN materias m ON d.materia_id = m.id
WHERE d.rn > 1
ORDER BY d.fecha, al.apellido, m.nombre;

-- Eliminar los registros duplicados (mantener solo el más reciente)
DELETE FROM asistencias 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY alumno_id, materia_id, fecha 
        ORDER BY creado_en DESC
      ) as rn
    FROM asistencias
  ) ranked
  WHERE rn > 1
);

-- Verificar que se eliminaron los duplicados
SELECT 
  alumno_id, 
  materia_id, 
  fecha,
  COUNT(*) as total_registros
FROM asistencias
GROUP BY alumno_id, materia_id, fecha
HAVING COUNT(*) > 1; 