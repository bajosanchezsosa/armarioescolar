
import { Asistencia, Materia } from '@/types/database';

export interface InasistenciaResult {
  valor: number;
  tipo: 'vacio' | 'presente-todo' | 'ausente-todo' | 'ausente-parcial' | 'ausente-clase' | 'ausente-taller' | 'ausente-ef';
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

  if (asistenciasAlumno.length === 0) {
    return { valor: 0, tipo: 'vacio', color: 'text-gray-400' };
  }

  // Obtener materias que tuvieron clases ese día
  const materiasConClase = [...new Set(asistenciasDelDia.map(a => a.materia_id))];
  const materiasDelDia = materias.filter(m => materiasConClase.includes(m.id));

  const materiasClaseDelDia = materiasDelDia.filter(m => m.tipo === 'Clase');
  const materiasTallerDelDia = materiasDelDia.filter(m => m.tipo === 'Taller');
  const materiasEFDelDia = materiasDelDia.filter(m => m.tipo === 'EF');

  // Verificar presencia
  const presenteEnClase = materiasClaseDelDia.length === 0 || materiasClaseDelDia.some(m => 
    asistenciasAlumno.some(a => a.materia_id === m.id && a.estado === 'P')
  );
  const presenteEnTaller = materiasTallerDelDia.length === 0 || materiasTallerDelDia.some(m => 
    asistenciasAlumno.some(a => a.materia_id === m.id && a.estado === 'P')
  );
  const presenteEnEF = materiasEFDelDia.length === 0 || materiasEFDelDia.some(m => 
    asistenciasAlumno.some(a => a.materia_id === m.id && a.estado === 'P')
  );

  const ausenteEnClase = materiasClaseDelDia.length > 0 && !presenteEnClase;
  const ausenteEnTaller = materiasTallerDelDia.length > 0 && !presenteEnTaller;
  const ausenteEnEF = materiasEFDelDia.length > 0 && !presenteEnEF;

  const totalMaterias = materiasClaseDelDia.length + materiasTallerDelDia.length + materiasEFDelDia.length;
  const materiasAusentes = (ausenteEnClase ? 1 : 0) + (ausenteEnTaller ? 1 : 0) + (ausenteEnEF ? 1 : 0);

  return calcularValorInasistencia(
    presenteEnClase, presenteEnTaller, presenteEnEF,
    ausenteEnClase, ausenteEnTaller, ausenteEnEF,
    totalMaterias, materiasAusentes
  );
};

const calcularValorInasistencia = (
  presenteEnClase: boolean, presenteEnTaller: boolean, presenteEnEF: boolean,
  ausenteEnClase: boolean, ausenteEnTaller: boolean, ausenteEnEF: boolean,
  totalMaterias: number, materiasAusentes: number
): InasistenciaResult => {
  if (presenteEnClase && presenteEnTaller && presenteEnEF) {
    return { valor: 0, tipo: 'presente-todo', color: 'text-green-600' };
  }

  if (materiasAusentes === totalMaterias) {
    return { valor: 1, tipo: 'ausente-todo', color: 'text-red-600' };
  }

  if (totalMaterias === 3 && materiasAusentes === 2) {
    return { valor: 0.5, tipo: 'ausente-parcial', color: 'text-red-600' };
  }

  if (totalMaterias === 3 && materiasAusentes === 1) {
    if (ausenteEnClase) {
      return { valor: 0.25, tipo: 'ausente-clase', color: 'text-red-600' };
    } else if (ausenteEnTaller) {
      return { valor: 0.25, tipo: 'ausente-taller', color: 'text-red-600' };
    } else if (ausenteEnEF) {
      return { valor: 0.25, tipo: 'ausente-ef', color: 'text-red-600' };
    }
  }

  if (totalMaterias === 2 && materiasAusentes === 1) {
    if (ausenteEnClase) {
      return { valor: 0.5, tipo: 'ausente-clase', color: 'text-red-600' };
    } else if (ausenteEnTaller) {
      return { valor: 0.5, tipo: 'ausente-taller', color: 'text-red-600' };
    } else if (ausenteEnEF) {
      return { valor: 0.5, tipo: 'ausente-ef', color: 'text-red-600' };
    }
  }

  if (totalMaterias === 1 && materiasAusentes === 1) {
    if (ausenteEnClase || ausenteEnTaller || ausenteEnEF) {
      return { valor: 1, tipo: 'ausente-clase', color: 'text-red-600' };
    }
  }

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
