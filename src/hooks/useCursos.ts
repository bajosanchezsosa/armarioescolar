
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Curso } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useCursos = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cursos'],
    queryFn: async (): Promise<Curso[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('activo', true)
        .order('anio', { ascending: true })
        .order('division', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user, // Solo ejecutar query si hay usuario autenticado
  });
};
