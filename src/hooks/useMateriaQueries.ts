
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Materia, MateriaModulo } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useMaterias = (cursoId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['materias', cursoId],
    queryFn: async (): Promise<Materia[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('materias')
        .select('*')
        .eq('curso_id', cursoId)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!cursoId,
  });
};

export const useMateriaModulos = (materiaId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['materia_modulos', materiaId],
    queryFn: async (): Promise<MateriaModulo[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('materia_modulos')
        .select('*')
        .eq('materia_id', materiaId)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!materiaId,
  });
};
