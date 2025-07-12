
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asistencia } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useAsistencias = (materiaId: string, fecha: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['asistencias', materiaId, fecha],
    queryFn: async (): Promise<Asistencia[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          alumnos:alumno_id (
            id,
            nombre,
            apellido,
            activo,
            grupo_taller
          )
        `)
        .eq('materia_id', materiaId)
        .eq('fecha', fecha);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!materiaId && !!fecha,
  });
};

export const useAsistenciasPorCurso = (cursoId: string, fecha: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['asistencias-curso', cursoId, fecha],
    queryFn: async (): Promise<Asistencia[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

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
        .eq('fecha', fecha)
        .eq('materias.curso_id', cursoId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!cursoId && !!fecha,
  });
};

export const useAsistenciasLog = (cursoId: string, materiaId: string, fecha: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['asistencias-log', cursoId, materiaId, fecha],
    queryFn: async () => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('asistencias_log')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('materia_id', materiaId)
        .eq('fecha', fecha)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!cursoId && !!materiaId && !!fecha,
  });
};
