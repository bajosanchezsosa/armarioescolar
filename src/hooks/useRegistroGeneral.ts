
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
      
      const { data, error } = await supabase
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
        .eq('alumnos.curso_id', cursoId)
        .eq('alumnos.activo', true);

      if (error) throw error;

      // Agrupar por fecha
      const result: Record<string, Asistencia[]> = {};
      
      fechas.forEach(fecha => {
        result[fecha] = (data || []).filter(asistencia => asistencia.fecha === fecha);
      });

      return result;
    },
    enabled: !!user && !!cursoId && workingDays.length > 0,
  });
};
