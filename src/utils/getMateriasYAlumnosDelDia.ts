import { Materia, MateriaModulo, Alumno } from '@/types/database';

/**
 * Obtiene las materias y alumnos que tienen clase un día específico para un curso y grupo.
 * @param materias Materias del curso
 * @param modulosPorMateria Módulos de cada materia (por materia_id)
 * @param alumnos Alumnos del curso
 * @param fecha Fecha a consultar (YYYY-MM-DD)
 * @param grupo Grupo a consultar ('A', 'B' o 'todos')
 * @returns { materiasDelDia, alumnosDelGrupo }
 */
export function getMateriasYAlumnosDelDia({
  materias,
  modulosPorMateria,
  alumnos,
  fecha,
  grupo,
}: {
  materias: Materia[];
  modulosPorMateria: Record<string, MateriaModulo[]>;
  alumnos: Alumno[];
  fecha: string;
  grupo: string;
}) {
  // Día de la semana (1=Lunes, ..., 7=Domingo) - SIEMPRE LOCAL
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Local
  const dia = date.getDay();
  const diaSemana = dia === 0 ? 7 : dia;
  // DEBUG: Log para ver el valor de diaSemana y los módulos
  console.log(`[DEBUG getMateriasYAlumnosDelDia] fecha: ${fecha}, diaSemana calculado: ${diaSemana}`);

  // Filtrar materias que tienen módulo ese día y grupo
  const materiasDelDia = materias.filter(materia => {
    const modulos = modulosPorMateria[String(materia.id).trim()] || [];
    // DEBUG: Log de módulos de la materia
    console.log(`[DEBUG getMateriasYAlumnosDelDia] materia: ${materia.nombre}, modulos:`, modulos);
    return modulos.some(modulo => {
      // Forzar a number por si acaso
      const moduloDia = Number(modulo.dia_semana);
      // DEBUG: Log de comparación
      console.log(`[DEBUG getMateriasYAlumnosDelDia] comparando moduloDia: ${moduloDia} === diaSemana: ${diaSemana} ?`, moduloDia === diaSemana, 'grupo:', modulo.grupo, 'vs', grupo);
      if (moduloDia !== diaSemana) return false;
      if (modulo.grupo === 'todos') return true;
      if (modulo.grupo === grupo) return true;
      return false;
    });
  });

  // Filtrar alumnos del grupo
  const alumnosDelGrupo = alumnos.filter(alumno => alumno.grupo_taller === grupo || grupo === 'todos');

  return { materiasDelDia, alumnosDelGrupo };
} 