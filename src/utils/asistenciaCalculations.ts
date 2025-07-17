
import { Asistencia, Materia, MateriaModulo } from '@/types/database';

export interface InasistenciaDetalleResult {
  valor: number; // suma de medias inasistencias, máximo 1
  tipos: string[]; // letras de inasistencias (C, T, EF)
  color: string; // color a usar si hay alguna inasistencia
  tipo: 'vacio' | 'presente-todo' | 'ausente-algunas' | 'ausente-todo';
}

// Función auxiliar para normalizar fechas a 'YYYY-MM-DD'
function normalizarFecha(fecha: string): string {
  return new Date(fecha).toISOString().slice(0, 10);
}

// Función auxiliar para determinar si un alumno tiene clase en un día específico
export const alumnoTieneClaseEnDia = (
  fecha: string,
  grupoAlumno: string,
  materias: Materia[],
  modulosPorMateria: Record<string, MateriaModulo[]>
): boolean => {
  // Convertir fecha a día de la semana (1=Lunes, 2=Martes, etc.)
  const dia = new Date(fecha).getDay();
  const diaSemana = dia === 0 ? 7 : dia; // Convertir domingo (0) a 7

  // Verificar si alguna materia tiene módulos para este día y grupo
  for (const materia of materias) {
    const modulos = modulosPorMateria[materia.id] || [];
    
    const tieneModuloEnDia = modulos.some(modulo => {
      // Verificar que el módulo sea para este día
      if (modulo.dia_semana !== diaSemana) return false;
      
      // Verificar que el módulo sea para el grupo del alumno
      if (modulo.grupo === 'todos') return true; // Todos los grupos
      if (modulo.grupo === grupoAlumno) return true; // Grupo específico
      
      return false;
    });
    
    if (tieneModuloEnDia) {
      return true;
    }
  }
  
  return false;
};

export const calcularInasistenciasDetalleDia = (
  alumnoId: string,
  fecha: string,
  registroData: Record<string, Asistencia[]>,
  materias: Materia[],
  modulosPorMateria?: Record<string, MateriaModulo[]>,
  grupoAlumno?: string
): InasistenciaDetalleResult => {
  const dia = new Date(fecha).getDay();
  const diaSemana = dia === 0 ? 7 : dia;

  let materiasConClase = materias.filter(materia => {
    const modulos = modulosPorMateria?.[String(materia.id).trim()] || [];
    if (modulos.length === 0) return false;
    return modulos.some(modulo => {
      if (modulo.dia_semana !== diaSemana) return false;
      if (modulo.grupo === 'todos') return true;
      if (grupoAlumno && modulo.grupo === grupoAlumno) return true;
      return false;
    });
  });

  // Normalizar la fecha para acceder a registroData
  const fechaNormalizada = normalizarFecha(fecha);
  const asistenciasDelDia = registroData[fechaNormalizada] || [];
  let asistenciasAlumno = asistenciasDelDia.filter(a => String(a.alumno_id).trim() === String(alumnoId).trim());
  if (materiasConClase.length === 0 && asistenciasAlumno.length > 0) {
    const materiaIds = Array.from(new Set(asistenciasAlumno.map(a => String(a.materia_id).trim())));
    materiasConClase = materias.filter(m => materiaIds.includes(String(m.id).trim()));
  }

  // LOG: materias del día
  console.log('[ASISTENCIA] Fecha:', fecha, 'Alumno:', alumnoId, 'Materias del día:', materiasConClase.map(m => ({ id: m.id, nombre: m.nombre, tipo: m.tipo })));
  // LOG: asistencias encontradas
  console.log('[ASISTENCIA] Asistencias del alumno:', asistenciasAlumno);

  if (materiasConClase.length === 0) {
    console.log('[ASISTENCIA] Resultado: vacio (sin materias ese día)');
    return { valor: 0, tipos: [], color: 'text-gray-400', tipo: 'vacio' as const };
  }

  const tiposDelDia = new Set<string>();
  const tiposAusentes = new Set<string>();
  const estadosPorMateria: Record<string, Asistencia | undefined> = {};
  materiasConClase.forEach(materia => {
    console.log('[ASISTENCIA][DEBUG] materia.id:', JSON.stringify(materia.id), 'asistenciasAlumno:', asistenciasAlumno.map(a => ({ materia_id: a.materia_id, estado: a.estado })));
    estadosPorMateria[String(materia.id).trim()] = asistenciasAlumno.find(a => String(a.materia_id).trim() === String(materia.id).trim() && a.estado && a.estado.trim().toUpperCase() !== 'SC');
    tiposDelDia.add(materia.tipo);
  });

  for (const materia of materiasConClase) {
    const asistencia = estadosPorMateria[String(materia.id).trim()];
    if (asistencia && asistencia.estado && asistencia.estado.trim().toUpperCase() === 'A') {
      if (materia.tipo === 'Clase') tiposAusentes.add('C');
      if (materia.tipo === 'Taller') tiposAusentes.add('T');
      if (materia.tipo === 'EF') tiposAusentes.add('EF');
    }
  }

  // LOG: tipos del día y ausentes
  console.log('[ASISTENCIA] Tipos del día:', Array.from(tiposDelDia), 'Tipos ausentes:', Array.from(tiposAusentes));

  const hayAlgunaAsistencia = Object.values(estadosPorMateria).some(a => a !== undefined);
  if (!hayAlgunaAsistencia) {
    console.log('[ASISTENCIA] Resultado: vacio (sin asistencias cargadas)');
    return { valor: 0, tipos: [], color: 'text-gray-400', tipo: 'vacio' as const };
  }

  // Nueva lógica:
  if (tiposAusentes.size === 0 && tiposDelDia.size > 0) {
    console.log('[ASISTENCIA] Resultado: presente-todo');
    return { valor: 0, tipos: [], color: 'text-green-600', tipo: 'presente-todo' as const };
  }

  if (tiposAusentes.size > 0) {
    // Si está ausente en TODOS los tipos del día => inasistencia entera
    if (tiposAusentes.size === tiposDelDia.size) {
      console.log('[ASISTENCIA] Resultado: ausente-todo (inasistencia entera)');
      return { valor: 1, tipos: Array.from(tiposAusentes), color: 'text-red-600', tipo: 'ausente-todo' as const };
    } else {
      // Si está ausente en al menos un tipo pero presente en otros => media inasistencia
      console.log('[ASISTENCIA] Resultado: ausente-algunas (media inasistencia)');
      return { valor: 0.5, tipos: Array.from(tiposAusentes), color: 'text-orange-600', tipo: 'ausente-algunas' as const };
    }
  }

  const tardanzas = Object.values(estadosPorMateria).filter(a => a && a.estado && a.estado.trim().toUpperCase() === 'T').length;
  const justificadas = Object.values(estadosPorMateria).filter(a => a && a.estado && a.estado.trim().toUpperCase() === 'J').length;
  if ((tardanzas > 0 || justificadas > 0) && tiposAusentes.size === 0) {
    console.log('[ASISTENCIA] Resultado: presente-todo (solo tardanzas/justificadas)');
    return { valor: 0, tipos: [], color: 'text-green-600', tipo: 'presente-todo' as const };
  }

  console.log('[ASISTENCIA] Resultado: vacio (por defecto)');
  return { valor: 0, tipos: [], color: 'text-gray-400', tipo: 'vacio' as const };
};

export const calcularTotalPeriodo = (
  alumnoId: string,
  fechas: string[],
  registroData: Record<string, Asistencia[]>,
  materias: Materia[]
): number => {
  return fechas.reduce((total, fecha) => {
    const inasistencia = calcularInasistenciasDetalleDia(alumnoId, fecha, registroData, materias);
    return total + (inasistencia.tipo === 'vacio' ? 0 : inasistencia.valor);
  }, 0);
};

/**
 * Calcula el estado de asistencia de un alumno para el registro general mensual.
 * @param alumnoId ID del alumno
 * @param fecha Fecha (YYYY-MM-DD)
 * @param materiasDelDia Materias que tiene ese día
 * @param asistenciasDelDia Asistencias cargadas para ese alumno y fecha
 * @returns { valor, tipos, color, tipo }
 */
export function calcularEstadoAsistenciaGeneral({
  alumnoId,
  fecha,
  materiasDelDia,
  asistenciasDelDia,
}: {
  alumnoId: string;
  fecha: string;
  materiasDelDia: Materia[];
  asistenciasDelDia: Asistencia[];
}): InasistenciaDetalleResult {
  if (materiasDelDia.length === 0) {
    return { valor: 0, tipos: [], color: 'text-gray-400', tipo: 'vacio' };
  }

  // Filtrar asistencias del alumno para las materias del día
  const asistenciasAlumno = asistenciasDelDia.filter(a => String(a.alumno_id).trim() === String(alumnoId).trim());

  // Mapear estado por materia
  const estadosPorMateria: Record<string, Asistencia | undefined> = {};
  materiasDelDia.forEach(materia => {
    estadosPorMateria[String(materia.id).trim()] = asistenciasAlumno.find(a => String(a.materia_id).trim() === String(materia.id).trim() && a.estado && a.estado.trim().toUpperCase() !== 'SC');
  });

  const tiposDelDia = new Set<string>();
  const tiposAusentes = new Set<string>();

  materiasDelDia.forEach(materia => {
    tiposDelDia.add(materia.tipo);
    const asistencia = estadosPorMateria[String(materia.id).trim()];
    if (asistencia && asistencia.estado && asistencia.estado.trim().toUpperCase() === 'A') {
      if (materia.tipo === 'Clase') tiposAusentes.add('C');
      if (materia.tipo === 'Taller') tiposAusentes.add('T');
      if (materia.tipo === 'EF') tiposAusentes.add('EF');
    }
  });

  const hayAlgunaAsistencia = Object.values(estadosPorMateria).some(a => a !== undefined);
  if (!hayAlgunaAsistencia) {
    return { valor: 0, tipos: [], color: 'text-gray-400', tipo: 'vacio' };
  }

  if (tiposAusentes.size === 0 && tiposDelDia.size > 0) {
    return { valor: 0, tipos: [], color: 'text-green-600', tipo: 'presente-todo' };
  }

  if (tiposAusentes.size > 0) {
    if (tiposAusentes.size === tiposDelDia.size) {
      // Ausente en todos los tipos
      return { valor: 1, tipos: Array.from(tiposAusentes), color: 'text-red-600', tipo: 'ausente-todo' };
    } else {
      // Ausente en algunos tipos pero presente en otros
      return { valor: 0.5, tipos: Array.from(tiposAusentes), color: 'text-orange-600', tipo: 'ausente-algunas' };
    }
  }

  // Si solo hay tardanzas o justificadas, se considera presente
  const tardanzas = Object.values(estadosPorMateria).filter(a => a && a.estado && a.estado.trim().toUpperCase() === 'T').length;
  const justificadas = Object.values(estadosPorMateria).filter(a => a && a.estado && a.estado.trim().toUpperCase() === 'J').length;
  if ((tardanzas > 0 || justificadas > 0) && tiposAusentes.size === 0) {
    return { valor: 0, tipos: [], color: 'text-green-600', tipo: 'presente-todo' };
  }

  return { valor: 0, tipos: [], color: 'text-gray-400', tipo: 'vacio' };
}
