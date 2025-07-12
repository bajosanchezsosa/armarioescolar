
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type DiaSinClase = {
  id: string;
  curso_id: string;
  fecha: string;
  motivo: string;
  descripcion?: string;
  created_at: string;
  user_id: string;
};

export const useDiasSinClase = (cursoId: string) => {
  return useQuery({
    queryKey: ['dias-sin-clase', cursoId],
    queryFn: async (): Promise<DiaSinClase[]> => {
      const { data, error } = await supabase
        .from('dias_sin_clase')
        .select('*')
        .eq('curso_id', cursoId)
        .order('fecha', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!cursoId,
  });
};

export const useCreateDiaSinClase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { curso_id: string; fecha: string; motivo: string; descripcion?: string }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data: result, error } = await supabase
        .from('dias_sin_clase')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dias-sin-clase', data.curso_id] });
      toast({
        title: "Día sin clase registrado",
        description: `Se ha marcado el día como sin actividad escolar.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar el día sin clase.",
        variant: "destructive",
      });
      console.error('Error creating dia sin clase:', error);
    },
  });
};

export const useUpdateDiaSinClase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { id: string; motivo: string; descripcion?: string }) => {
      const { data: result, error } = await supabase
        .from('dias_sin_clase')
        .update({
          motivo: data.motivo,
          descripcion: data.descripcion
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dias-sin-clase', data.curso_id] });
      toast({
        title: "Día sin clase actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el día sin clase.",
        variant: "destructive",
      });
      console.error('Error updating dia sin clase:', error);
    },
  });
};

export const useDeleteDiaSinClase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dias_sin_clase')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dias-sin-clase'] });
      toast({
        title: "Día sin clase eliminado",
        description: "Se ha eliminado el registro del día sin clase.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el día sin clase.",
        variant: "destructive",
      });
      console.error('Error deleting dia sin clase:', error);
    },
  });
};

export const useDiasSinClaseMutations = (cursoId: string) => {
  const createDiaSinClase = useCreateDiaSinClase();
  const updateDiaSinClase = useUpdateDiaSinClase();
  const deleteDiaSinClase = useDeleteDiaSinClase();

  return {
    createDiaSinClase,
    updateDiaSinClase,
    deleteDiaSinClase,
  };
};
