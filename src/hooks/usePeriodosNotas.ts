
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PeriodoNota {
  id: string;
  curso_id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeriodoNotaInput {
  curso_id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
}

export const usePeriodosNotas = (cursoId: string) => {
  return useQuery({
    queryKey: ['periodos-notas', cursoId],
    queryFn: async () => {
      console.log('Fetching períodos for curso:', cursoId);
      
      const { data, error } = await supabase
        .from('periodos_notas')
        .select('*')
        .eq('curso_id', cursoId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching períodos:', error);
        throw error;
      }

      console.log('Períodos fetched:', data?.length || 0);
      return data as PeriodoNota[];
    },
  });
};

export const useCreatePeriodoNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodo: PeriodoNotaInput) => {
      console.log('Creating período:', periodo);
      
      const { data, error } = await supabase
        .from('periodos_notas')
        .insert([periodo])
        .select()
        .single();

      if (error) {
        console.error('Error creating período:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['periodos-notas'] });
      toast.success('Período creado exitosamente');
      console.log('Período created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating período:', error);
      toast.error('Error al crear el período');
    },
  });
};

export const useUpdatePeriodoNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PeriodoNotaInput> & { id: string }) => {
      console.log('Updating período:', id, updates);
      
      const { data, error } = await supabase
        .from('periodos_notas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating período:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['periodos-notas'] });
      toast.success('Período actualizado exitosamente');
      console.log('Período updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating período:', error);
      toast.error('Error al actualizar el período');
    },
  });
};
