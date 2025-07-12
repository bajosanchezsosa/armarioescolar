
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMateriaDelete = (cursoId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materiaId: string) => {
      const { error } = await supabase
        .from('materias')
        .delete()
        .eq('id', materiaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materias', cursoId] });
      toast({
        title: 'Materia eliminada',
        description: 'La materia se eliminó correctamente.',
      });
    },
    onError: (error) => {
      console.error('Error deleting materia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la materia.',
        variant: 'destructive',
      });
    },
  });
};
