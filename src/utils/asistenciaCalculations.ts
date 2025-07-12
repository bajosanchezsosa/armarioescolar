
import { Asistencia, Materia } from '@/types/database';

export interface InasistenciaResult {
  valor: number;
  tipo: 'vacio' | 'presente-todo' | 'ausente-todo' | 'ausente-clase' | 'ausente-taller' | 'ausente-ef' | 'presente' | 'inasistencia';
  color: string;
}

export const calcularInasistenciasDia = (
  alumnoId: string,
  fecha: string,
  registroData: Record<string, Asistencia[]>,
  materias: Materia[]
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
  const totalMaterias = asistenciasAlumno.length;

  console.log(`Resumen del alumno:`);
  console.log(`- Total materias: ${totalMaterias}`);
  console.log(`- Ausencias: ${ausencias}`);
  console.log(`- Presencias: ${presencias}`);
  console.log(`- Tardanzas: ${tardanzas}`);
  console.log(`- Justificadas: ${justificadas}`);

  // LÓGICA DE CÁLCULO CORREGIDA
  if (totalMaterias === 0) {
    // No hay materias registradas para este día
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  if (ausencias === totalMaterias) {
    // Ausente en todas las materias del día
    console.log(`Resultado: Ausente en todo (${ausencias} inasistencias)`);
    return { 
      valor: ausencias, 
      tipo: 'ausente-todo', 
      color: ausencias >= 2 ? 'text-red-600' : 'text-orange-500' 
    };
  }

  if (presencias === totalMaterias) {
    // Presente en todas las materias del día
    console.log(`Resultado: Presente en todo (0 inasistencias)`);
    return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
  }

  // CASO DE MEDIA INASISTENCIA: Ausente en algunas materias, presente en otras
  if (ausencias > 0 && presencias > 0) {
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

  // Si solo hay tardanzas o justificadas, considerar como presente
  if ((tardanzas > 0 || justificadas > 0) && ausencias === 0 && presencias === 0) {
    console.log(`Resultado: Presente (tardanzas/justificadas)`);
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
