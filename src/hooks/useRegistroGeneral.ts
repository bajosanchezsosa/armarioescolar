
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asistencia } from '@/types/database';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export const useRegistroGeneralData = (cursoId: string, workingDays: Date[]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['registro-general', cursoId, workingDays.map(d => format(d, 'yyyy-MM-dd'))],
    queryFn: async (): Promise<Record<string, Asistencia[]>> => {
      if (!user || workingDays.length === 0) {
        throw new Error('Usuario no autenticado o sin días válidos');
      }

      const fechas = workingDays.map(day => format(day, 'yyyy-MM-dd'));
      
      console.log(`=== DEBUG REGISTRO GENERAL ===`);
      console.log(`Curso ID: ${cursoId}`);
      console.log(`Fechas a consultar:`, fechas);
      
      // Primero obtener todos los alumnos del curso
      const { data: alumnos, error: errorAlumnos } = await supabase
        .from('alumnos')
        .select('id, nombre, apellido, activo, grupo_taller, curso_id')
        .eq('curso_id', cursoId)
        .eq('activo', true);

      if (errorAlumnos) throw errorAlumnos;

      console.log(`Alumnos del curso:`, alumnos);
      console.log(`Total alumnos:`, alumnos?.length || 0);

      // Luego obtener todas las asistencias para las fechas especificadas
      const alumnoIds = (alumnos || []).map(a => a.id);

      const { data: asistencias, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          alumnos:alumno_id (
            id,
            nombre,
            apellido,
            activo,
            grupo_taller,
            curso_id
          ),
          materias:materia_id (
            id,
            nombre,
            tipo,
            curso_id
          )
        `)
        .in('fecha', fechas)
        .in('alumno_id', alumnoIds); // <--- filtro correcto por alumnos del curso

      if (error) throw error;

      console.log(`Datos obtenidos de la BD:`, asistencias);
      console.log(`Total de registros de asistencia:`, asistencias?.length || 0);

      // Agrupar por fecha
      const result: Record<string, Asistencia[]> = {};
      
      fechas.forEach(fecha => {
        result[fecha] = (asistencias || []).filter(asistencia => asistencia.fecha === fecha);
        console.log(`Asistencias para ${fecha}:`, result[fecha]);
      });

      console.log(`=== FIN DEBUG REGISTRO GENERAL ===`);
      return result;
    },
    enabled: !!user && !!cursoId && workingDays.length > 0,
  });
};
