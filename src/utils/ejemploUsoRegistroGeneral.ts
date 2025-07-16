/**
 * Ejemplo de uso de las funciones de registro general
 * 
 * Este archivo muestra cómo usar las funciones:
 * - getMateriasYAlumnosDelDia
 * - calcularEstadoAsistenciaGeneral  
 * - generarRegistroGeneral
 * 
 * Para probar la lógica antes de integrarla en la webapp.
 */

import { Materia, MateriaModulo, Alumno, Asistencia } from '@/types/database';
import { getMateriasYAlumnosDelDia } from './getMateriasYAlumnosDelDia';
import { calcularEstadoAsistenciaGeneral } from './asistenciaCalculations';
import { generarRegistroGeneral } from './generarRegistroGeneral';

// Datos de ejemplo
const materiasEjemplo: Materia[] = [
  {
    id: '1',
    curso_id: 'curso-1',
    nombre: 'Matemática',
    tipo: 'Clase',
    creado_en: new Date().toISOString(),
    profesor: 'Prof. García'
  },
  {
    id: '2', 
    curso_id: 'curso-1',
    nombre: 'Taller de Informática',
    tipo: 'Taller',
    creado_en: new Date().toISOString(),
    profesor: 'Prof. López'
  },
  {
    id: '3',
    curso_id: 'curso-1', 
    nombre: 'Educación Física',
    tipo: 'EF',
    creado_en: new Date().toISOString(),
    profesor: 'Prof. Martínez'
  }
];

const modulosEjemplo: Record<string, MateriaModulo[]> = {
  '1': [
    {
      id: 'mod-1',
      materia_id: '1',
      dia_semana: 1, // Lunes
      hora_inicio: '08:00',
      cantidad_modulos: 2,
      grupo: 'todos'
    },
    {
      id: 'mod-2', 
      materia_id: '1',
      dia_semana: 3, // Miércoles
      hora_inicio: '10:00',
      cantidad_modulos: 2,
      grupo: 'todos'
    }
  ],
  '2': [
    {
      id: 'mod-3',
      materia_id: '2', 
      dia_semana: 2, // Martes
      hora_inicio: '14:00',
      cantidad_modulos: 2,
      grupo: 'A'
    }
  ],
  '3': [
    {
      id: 'mod-4',
      materia_id: '3',
      dia_semana: 4, // Jueves
      hora_inicio: '16:00', 
      cantidad_modulos: 2,
      grupo: 'todos'
    }
  ]
};

const alumnosEjemplo: Alumno[] = [
  {
    id: 'alum-1',
    curso_id: 'curso-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    grupo_taller: 'A',
    activo: true,
    creado_en: new Date().toISOString(),
    dni: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    direccion: '',
    contacto_nombre: '',
    contacto_tel: ''
  },
  {
    id: 'alum-2',
    curso_id: 'curso-1', 
    nombre: 'María',
    apellido: 'González',
    grupo_taller: 'B',
    activo: true,
    creado_en: new Date().toISOString(),
    dni: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    direccion: '',
    contacto_nombre: '',
    contacto_tel: ''
  }
];

const asistenciasEjemplo: Asistencia[] = [
  {
    id: 'asist-1',
    alumno_id: 'alum-1',
    materia_id: '1',
    fecha: '2024-03-04', // Lunes
    estado: 'P',
    user_id: 'user-1',
    creado_en: new Date().toISOString()
  },
  {
    id: 'asist-2',
    alumno_id: 'alum-1', 
    materia_id: '2',
    fecha: '2024-03-05', // Martes
    estado: 'A',
    user_id: 'user-1',
    creado_en: new Date().toISOString()
  }
];

// Ejemplo 1: Obtener materias y alumnos de un día específico
export function ejemploGetMateriasYAlumnosDelDia() {
  const fecha = '2024-03-04'; // Lunes
  const grupo = 'A';
  
  const resultado = getMateriasYAlumnosDelDia({
    materias: materiasEjemplo,
    modulosPorMateria: modulosEjemplo,
    alumnos: alumnosEjemplo,
    fecha,
    grupo
  });
  
  console.log('Materias del día:', resultado.materiasDelDia.map(m => m.nombre));
  console.log('Alumnos del grupo:', resultado.alumnosDelGrupo.map(a => `${a.apellido}, ${a.nombre}`));
  
  return resultado;
}

// Ejemplo 2: Calcular estado de asistencia de un alumno
export function ejemploCalcularEstadoAsistencia() {
  const alumnoId = 'alum-1';
  const fecha = '2024-03-04';
  const materiasDelDia = materiasEjemplo.filter(m => m.id === '1'); // Solo Matemática
  const asistenciasDelDia = asistenciasEjemplo.filter(a => a.fecha === fecha);
  
  const estado = calcularEstadoAsistenciaGeneral({
    alumnoId,
    fecha,
    materiasDelDia,
    asistenciasDelDia
  });
  
  console.log('Estado de asistencia:', estado);
  return estado;
}

// Ejemplo 3: Generar registro general completo
export function ejemploGenerarRegistroGeneral() {
  const resultado = generarRegistroGeneral({
    alumnos: alumnosEjemplo,
    materias: materiasEjemplo,
    modulosPorMateria: modulosEjemplo,
    asistencias: asistenciasEjemplo,
    mes: 3, // Marzo
    anio: 2024,
    grupo: 'todos',
    diasSinClase: []
  });
  
  console.log('Días hábiles:', resultado.diasHabiles);
  console.log('Alumnos en registro:', resultado.alumnos.length);
  console.log('Total primer alumno:', resultado.alumnos[0]?.totalMes);
  
  return resultado;
}

// Función para ejecutar todos los ejemplos
export function ejecutarEjemplos() {
  console.log('=== EJEMPLO 1: Materias y alumnos del día ===');
  ejemploGetMateriasYAlumnosDelDia();
  
  console.log('\n=== EJEMPLO 2: Estado de asistencia ===');
  ejemploCalcularEstadoAsistencia();
  
  console.log('\n=== EJEMPLO 3: Registro general completo ===');
  ejemploGenerarRegistroGeneral();
} 