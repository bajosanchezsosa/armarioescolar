
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
  modulosPorMateria?: Record<string, MateriaModulo[]>
): InasistenciaResult => {
  const asistenciasDelDia = registroData[fecha] || [];
  const asistenciasAlumno = asistenciasDelDia.filter(a => a.alumno_id === alumnoId);

  console.log(`=== DEBUG ASISTENCIA SIMPLIFICADA ===`);
  console.log(`Alumno ID: ${alumnoId}, Fecha: ${fecha}`);
  console.log(`Total asistencias del día: ${asistenciasDelDia.length}`);
  console.log(`Asistencias del alumno: ${asistenciasAlumno.length}`);

  // Si no hay asistencias registradas para este alumno
  if (asistenciasAlumno.length === 0) {
    console.log(`No hay asistencias registradas para este alumno`);
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  // DEBUG DETALLADO DE ASISTENCIAS DEL ALUMNO
  console.log(`DEBUG ASISTENCIAS DEL ALUMNO:`);
  asistenciasAlumno.forEach(asistencia => {
    const materia = materias.find(m => m.id === asistencia.materia_id);
    console.log(`- Materia: ${materia?.nombre || 'Desconocida'} (${materia?.tipo || 'Sin tipo'}) - Estado: ${asistencia.estado}`);
  });

  // LÓGICA CORREGIDA: Considerar cada materia individualmente
  const ausencias = asistenciasAlumno.filter(a => a.estado === 'A').length;
  const presencias = asistenciasAlumno.filter(a => a.estado === 'P').length;
  const tardanzas = asistenciasAlumno.filter(a => a.estado === 'T').length;
  const justificadas = asistenciasAlumno.filter(a => a.estado === 'J').length;
  const sinClase = asistenciasAlumno.filter(a => a.estado === 'SC').length;
  const totalMaterias = asistenciasAlumno.length;

  console.log(`Resumen del alumno:`);
  console.log(`- Total materias: ${totalMaterias}`);
  console.log(`- Ausencias: ${ausencias}`);
  console.log(`- Presencias: ${presencias}`);
  console.log(`- Tardanzas: ${tardanzas}`);
  console.log(`- Justificadas: ${justificadas}`);
  console.log(`- Sin Clase: ${sinClase}`);

  // LÓGICA DE CÁLCULO CORREGIDA
  if (totalMaterias === 0) {
    // No hay materias registradas para este día
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  // Si todas las materias están marcadas como "Sin Clase", no contar como presente
  if (sinClase === totalMaterias) {
    console.log(`Resultado: Todas las materias sin clase (no cuenta como presente)`);
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  // Filtrar solo las materias que NO están marcadas como "Sin Clase"
  const materiasConClase = asistenciasAlumno.filter(a => a.estado !== 'SC');
  const ausenciasConClase = materiasConClase.filter(a => a.estado === 'A').length;
  const presenciasConClase = materiasConClase.filter(a => a.estado === 'P').length;
  const totalMateriasConClase = materiasConClase.length;

  console.log(`Materias con clase: ${totalMateriasConClase}`);
  console.log(`- Ausencias con clase: ${ausenciasConClase}`);
  console.log(`- Presencias con clase: ${presenciasConClase}`);

  // Si no hay materias con clase, no contar como presente
  if (totalMateriasConClase === 0) {
    console.log(`Resultado: No hay materias con clase (no cuenta como presente)`);
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  if (ausenciasConClase === totalMateriasConClase) {
    // Ausente en todas las materias con clase
    console.log(`Resultado: Ausente en todas las materias con clase (${ausenciasConClase} inasistencias)`);
    return { 
      valor: ausenciasConClase, 
      tipo: 'ausente-todo', 
      color: ausenciasConClase >= 2 ? 'text-red-600' : 'text-orange-500' 
    };
  }

  if (presenciasConClase === totalMateriasConClase) {
    // Presente en todas las materias con clase
    console.log(`Resultado: Presente en todas las materias con clase (0 inasistencias)`);
    return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
  }

  // CASO DE MEDIA INASISTENCIA: Ausente en algunas materias con clase, presente en otras
  if (ausenciasConClase > 0 && presenciasConClase > 0) {
    console.log(`Resultado: Media inasistencia (0.5 inasistencias)`);
    
    // Determinar el tipo de materia donde está ausente
    const materiasAusentes = asistenciasAlumno.filter(a => a.estado === 'A');
    const primeraMateriaAusente = materias.find(m => m.id === materiasAusentes[0]?.materia_id);
    
    if (primeraMateriaAusente?.tipo === 'Clase') {
      return { valor: 0.5, tipo: 'ausente-clase', color: 'text-red-600' };
    }
    if (primeraMateriaAusente?.tipo === 'Taller') {
      return { valor: 0.5, tipo: 'ausente-taller', color: 'text-red-600' };
    }
    if (primeraMateriaAusente?.tipo === 'EF') {
      return { valor: 0.5, tipo: 'ausente-ef', color: 'text-red-600' };
    }
    
    // Si no se puede determinar el tipo, usar ausente-todo
    return { valor: 0.5, tipo: 'ausente-todo', color: 'text-red-600' };
  }

  // Si solo hay tardanzas o justificadas en materias con clase, considerar como presente
  if ((tardanzas > 0 || justificadas > 0) && ausenciasConClase === 0 && presenciasConClase === 0) {
    console.log(`Resultado: Presente (tardanzas/justificadas en materias con clase)`);
    return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
  }

  // Caso por defecto (no debería llegar aquí)
  console.log(`Resultado: Caso por defecto - presente`);
  return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
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
