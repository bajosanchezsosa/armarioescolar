
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export const useCreateMateriaModulo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newModulo: TablesInsert<'materia_modulos'>) => {
      const { data, error } = await supabase
        .from('materia_modulos')
        .insert(newModulo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materia_modulos', data.materia_id] });
      toast({
        title: "Módulo agregado",
        description: "El módulo horario ha sido agregado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el módulo. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error creating materia modulo:', error);
    },
  });
};

export const useUpdateMateriaModulo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'materia_modulos'> }) => {
      const { data, error } = await supabase
        .from('materia_modulos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materia_modulos', data.materia_id] });
      toast({
        title: "Módulo actualizado",
        description: "El módulo horario ha sido actualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el módulo. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error updating materia modulo:', error);
    },
  });
};

export const useDeleteMateriaModulo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('materia_modulos')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materia_modulos', data.materia_id] });
      toast({
        title: "Módulo eliminado",
        description: "El módulo horario ha sido eliminado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el módulo. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error deleting materia modulo:', error);
    },
  });
};
