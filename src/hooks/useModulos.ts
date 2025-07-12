
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MateriaModulo } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useModulos = (cursoId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['modulos', cursoId],
    queryFn: async (): Promise<MateriaModulo[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Fetching modulos for curso:', cursoId);

      const { data, error } = await supabase
        .from('materia_modulos')
        .select(`
          *,
          materia:materias!inner(
            id,
            nombre,
            tipo,
            curso_id
          )
        `)
        .eq('materia.curso_id', cursoId)
        .order('dia_semana')
        .order('hora_inicio');

      if (error) {
        console.error('Error fetching modulos:', error);
        throw error;
      }

      console.log('Modulos fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!user && !!cursoId,
  });
};
