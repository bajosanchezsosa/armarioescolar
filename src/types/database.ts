import { Database } from '@/integrations/supabase/types';

export type Curso = Database['public']['Tables']['cursos']['Row'];
export type Alumno = Database['public']['Tables']['alumnos']['Row'];
export type Materia = Database['public']['Tables']['materias']['Row'];
export type MateriaModulo = Database['public']['Tables']['materia_modulos']['Row'];
export type Asistencia = Database['public']['Tables']['asistencias']['Row'];
export type PlanillaNotas = Database['public']['Tables']['planillas_notas']['Row'];
export type Nota = Database['public']['Tables']['notas']['Row'];
export type Acta = Database['public']['Tables']['actas']['Row'];
export type ActaAlumno = Database['public']['Tables']['acta_alumnos']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type DiaSinClase = Database['public']['Tables']['dias_sin_clase']['Row'];

export type EstadoAsistencia = 'P' | 'A' | 'T' | 'J';
export type TipoMateria = 'Clase' | 'Taller' | 'EF';
export type GrupoTaller = 'A' | 'B' | 'todos';
export type Turno = 'mañana' | 'tarde' | 'noche';
export type TipoActa = 'curso' | 'alumno' | 'salud' | 'accidente' | 'disciplinario' | 'otro';
export type PrioridadActa = 'baja' | 'media' | 'alta' | 'critica';

// Tipo extendido para actas con relaciones
export type ActaConAlumnos = Acta & {
  acta_alumnos: (ActaAlumno & {
    alumnos: Alumno;
  })[];
};