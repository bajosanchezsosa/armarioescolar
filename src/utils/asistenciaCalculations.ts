
import { Asistencia, Materia, MateriaModulo } from '@/types/database';

export interface InasistenciaResult {
  valor: number;
  tipo: 'vacio' | 'presente-todo' | 'ausente-todo' | 'ausente-clase' | 'ausente-taller' | 'ausente-ef' | 'presente' | 'inasistencia';
  color: string;
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

export const calcularInasistenciasDia = (
  alumnoId: string,
  fecha: string,
  registroData: Record<string, Asistencia[]>,
  materias: Materia[],
  modulosPorMateria?: Record<string, MateriaModulo[]>,
  grupoAlumno?: string
): InasistenciaResult => {
  // Determinar día de la semana (1=Lunes, ..., 7=Domingo)
  const dia = new Date(fecha).getDay();
  const diaSemana = dia === 0 ? 7 : dia;

  // Filtrar materias donde el alumno tiene clase ese día según su grupo
  let materiasConClase = materias.filter(materia => {
    const modulos = modulosPorMateria?.[materia.id] || [];
    if (modulos.length === 0) return false;
    return modulos.some(modulo => {
      if (modulo.dia_semana !== diaSemana) return false;
      if (modulo.grupo === 'todos') return true;
      if (grupoAlumno && modulo.grupo === grupoAlumno) return true;
      return false;
    });
  });

  // --- VERSIÓN RELAJADA ---
  // Si no hay materias con clase pero hay asistencias para el alumno ese día, usar las materias de las asistencias
  const asistenciasDelDia = registroData[fecha] || [];
  let asistenciasAlumno = asistenciasDelDia.filter(a => String(a.alumno_id).trim() === String(alumnoId).trim());
  if (materiasConClase.length === 0 && asistenciasAlumno.length > 0) {
    // Buscar las materias de las asistencias
    const materiaIds = Array.from(new Set(asistenciasAlumno.map(a => a.materia_id)));
    materiasConClase = materias.filter(m => materiaIds.includes(m.id));
  }

  // --- LÓGICA SIMPLIFICADA SEGÚN NUEVA REGLA ---
  // Si no tiene ninguna materia con clase ese día, devolver vacio
  if (materiasConClase.length === 0) {
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  // Buscar asistencias del alumno para ese día y esas materias
  asistenciasAlumno = asistenciasDelDia.filter(a => String(a.alumno_id).trim() === String(alumnoId).trim() && materiasConClase.some(m => String(m.id).trim() === String(a.materia_id).trim()));

  if (asistenciasAlumno.length === 0) {
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  // Filtrar solo las materias que NO están marcadas como "Sin Clase"
  const materiasConClaseEfectiva = asistenciasAlumno.filter(a => a.estado !== 'SC');
  const totalMateriasConClase = materiasConClaseEfectiva.length;
  if (totalMateriasConClase === 0) {
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  const ausencias = materiasConClaseEfectiva.filter(a => a.estado === 'A');
  const presencias = materiasConClaseEfectiva.filter(a => a.estado === 'P');

  // Si está ausente en todas las materias con clase
  if (ausencias.length === totalMateriasConClase) {
    return { valor: 1, tipo: 'ausente-todo', color: 'text-red-600' };
  }

  // Si está presente en todas las materias con clase
  if (presencias.length === totalMateriasConClase) {
    return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
  }

  // Si hay al menos un ausente pero no en todas
  if (ausencias.length > 0 && ausencias.length < totalMateriasConClase) {
    // Buscar el primer tipo de materia ausente de ese día
    const materiaAusente = materiasConClase.find(m => ausencias.some(a => String(a.materia_id).trim() === String(m.id).trim()));
    if (materiaAusente?.tipo === 'Clase') {
      return { valor: 0.5, tipo: 'ausente-clase', color: 'text-orange-600' };
    }
    if (materiaAusente?.tipo === 'Taller') {
      return { valor: 0.5, tipo: 'ausente-taller', color: 'text-orange-600' };
    }
    if (materiaAusente?.tipo === 'EF') {
      return { valor: 0.5, tipo: 'ausente-ef', color: 'text-orange-600' };
    }
    // Si no se puede determinar, usar ausente-todo
    return { valor: 0.5, tipo: 'ausente-todo', color: 'text-orange-600' };
  }

  // Si solo hay tardanzas o justificadas, considerar como presente
  const tardanzas = materiasConClaseEfectiva.filter(a => a.estado === 'T').length;
  const justificadas = materiasConClaseEfectiva.filter(a => a.estado === 'J').length;
  if ((tardanzas > 0 || justificadas > 0) && ausencias.length === 0 && presencias.length === 0) {
    return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
  }

  // Caso por defecto
  return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
};

export const calcularTotalPeriodo = (
  alumnoId: string,
  fechas: string[],
  registroData: Record<string, Asistencia[]>,
  materias: Materia[]
): number => {
  return fechas.reduce((total, fecha) => {
    const inasistencia = calcularInasistenciasDia(alumnoId, fecha, registroData, materias);
    return total + (inasistencia.tipo === 'vacio' ? 0 : inasistencia.valor);
  }, 0);
};
