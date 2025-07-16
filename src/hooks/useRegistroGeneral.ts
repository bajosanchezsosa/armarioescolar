
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asistencia } from '@/types/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export const useRegistroGeneralData = (cursoId: string, mes: number, anio: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['registro-general', cursoId, mes, anio],
    queryFn: async (): Promise<Record<string, Asistencia[]>> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log(`=== DEBUG REGISTRO GENERAL ===`);
      console.log(`Curso ID: ${cursoId}`);
      console.log(`Mes: ${mes}, Año: ${anio}`);
      
      // Calcular rango de fechas del mes
      const monthStart = startOfMonth(new Date(anio, mes - 1, 1));
      const monthEnd = endOfMonth(new Date(anio, mes - 1, 1));
      
      // Obtener todas las asistencias del mes para el curso
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
        .gte('fecha', format(monthStart, 'yyyy-MM-dd'))
        .lte('fecha', format(monthEnd, 'yyyy-MM-dd'))
        .eq('alumnos.curso_id', cursoId)
        .eq('alumnos.activo', true);

      if (error) throw error;

      console.log(`Total de registros de asistencia:`, asistencias?.length || 0);

      // Agrupar por fecha
      const result: Record<string, Asistencia[]> = {};
      
      if (asistencias) {
        asistencias.forEach(asistencia => {
          if (!result[asistencia.fecha]) {
            result[asistencia.fecha] = [];
          }
          result[asistencia.fecha].push(asistencia);
        });
      }

      console.log(`=== FIN DEBUG REGISTRO GENERAL ===`);
      return result;
    },
    enabled: !!user && !!cursoId && mes > 0 && mes <= 12 && anio > 0,
  });
};
