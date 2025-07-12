
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Curso } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useCurso = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['curso', id],
    queryFn: async (): Promise<Curso | null> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', id)
        .eq('activo', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
};
