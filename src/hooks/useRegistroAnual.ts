
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asistencia } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useRegistroAnualData = (cursoId: string, year: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['registro-anual', cursoId, year],
    queryFn: async (): Promise<Record<string, Asistencia[]>> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
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
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .eq('alumnos.curso_id', cursoId)
        .eq('alumnos.activo', true);

      if (error) throw error;

      // Agrupar por fecha
      const result: Record<string, Asistencia[]> = {};
      
      (data || []).forEach(asistencia => {
        if (!result[asistencia.fecha]) {
          result[asistencia.fecha] = [];
        }
        result[asistencia.fecha].push(asistencia);
      });

      return result;
    },
    enabled: !!user && !!cursoId && !!year,
  });
};
