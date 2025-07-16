/**
 * Utilidades para generar el registro general mensual de asistencia
 * 
 * Este módulo contiene las funciones necesarias para:
 * 1. Calcular los días hábiles de un mes (lunes a viernes)
 * 2. Generar el registro general mensual con el estado de asistencia de cada alumno
 * 3. Calcular totales mensuales de inasistencias
 * 
 * La lógica respeta:
 * - Solo días hábiles (lunes a viernes)
 * - Filtrado por grupo de alumnos
 * - Cálculo correcto de media/entera inasistencia por día
 * - Diferenciación por tipo de materia (Clase, Taller, EF)
 */

import { Materia, MateriaModulo, Alumno, Asistencia } from '@/types/database';
import { getMateriasYAlumnosDelDia } from './getMateriasYAlumnosDelDia';
import { calcularEstadoAsistenciaGeneral, InasistenciaDetalleResult } from './asistenciaCalculations';
import { getDiasHabilesManuales, verificarDiasHabiles } from './diasHabilesManuales';
import { getDiasHabilesJulio2025 } from './diasHabiles2025';

interface RegistroGeneralCelda extends InasistenciaDetalleResult {
  fecha: string;
}

interface RegistroGeneralAlumno {
  alumno: Alumno;
  celdas: RegistroGeneralCelda[];
  totalMes: number;
}

export interface RegistroGeneralResultado {
  diasHabiles: string[];
  alumnos: RegistroGeneralAlumno[];
}

function getDiasHabilesDelMes(mes: number, anio: number, diasSinClase: string[] = []): string[] {
  // Caso especial para julio 2025
  if (mes === 7 && anio === 2025) {
    console.log('=== USANDO DÍAS HÁBILES ESPECÍFICOS JULIO 2025 ===');
    const diasHabiles = getDiasHabilesJulio2025();
    
    // Filtrar días sin clase si los hay
    if (diasSinClase.length > 0) {
      return diasHabiles.filter(fecha => !diasSinClase.includes(fecha));
    }
    
    return diasHabiles;
  }
  
  // Para otros meses, usar días hábiles manuales
  const diasHabiles = getDiasHabilesManuales(mes, anio);
  
  // Verificar que los días son correctos
  verificarDiasHabiles(mes, anio);
  
  // Filtrar días sin clase si los hay
  if (diasSinClase.length > 0) {
    return diasHabiles.filter(fecha => !diasSinClase.includes(fecha));
  }
  
  return diasHabiles;
}

/**
 * Genera el registro general mensual de asistencia para un curso.
 * @param alumnos Alumnos del curso
 * @param materias Materias del curso
 * @param modulosPorMateria Módulos de cada materia
 * @param asistencias Todas las asistencias del curso en el mes
 * @param mes Mes (1-12)
 * @param anio Año (ej: 2024)
 * @param grupo Grupo ('A', 'B', 'todos')
 * @param diasSinClase Fechas a omitir (opcional)
 * @returns RegistroGeneralResultado
 */
export function generarRegistroGeneral({
  alumnos,
  materias,
  modulosPorMateria,
  asistencias,
  mes,
  anio,
  grupo,
  diasSinClase = [],
}: {
  alumnos: Alumno[];
  materias: Materia[];
  modulosPorMateria: Record<string, MateriaModulo[]>;
  asistencias: Asistencia[];
  mes: number;
  anio: number;
  grupo: string;
  diasSinClase?: string[];
}): RegistroGeneralResultado {
  const diasHabiles = getDiasHabilesDelMes(mes, anio, diasSinClase);
  const resultado: RegistroGeneralAlumno[] = alumnos
    .filter(alumno => grupo === 'todos' || alumno.grupo_taller === grupo)
    .map(alumno => {
      const celdas: RegistroGeneralCelda[] = diasHabiles.map(fecha => {
        const { materiasDelDia } = getMateriasYAlumnosDelDia({
          materias,
          modulosPorMateria,
          alumnos,
          fecha,
          grupo: alumno.grupo_taller,
        });
        const asistenciasDelDia = asistencias.filter(a => a.fecha === fecha && String(a.alumno_id).trim() === String(alumno.id).trim());
        const estado = calcularEstadoAsistenciaGeneral({
          alumnoId: String(alumno.id),
          fecha,
          materiasDelDia,
          asistenciasDelDia,
        });
        return { ...estado, fecha };
      });
      const totalMes = celdas.reduce((acc, celda) => acc + (celda.tipo === 'vacio' ? 0 : celda.valor), 0);
      return { alumno, celdas, totalMes };
    });
  return { diasHabiles, alumnos: resultado };
} 