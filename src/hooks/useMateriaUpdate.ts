
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMateriaUpdate = (cursoId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      nombre: string;
      tipo: string;
      profesor?: string;
      modulos: Array<{
        dia_semana: number;
        hora_inicio: string;
        cantidad_modulos: number;
        grupo: string;
      }>;
    }) => {
      if (!user) throw new Error('No authenticated user');

      // Actualizar la materia
      const { data: materia, error: materiaError } = await supabase
        .from('materias')
        .update({
          nombre: data.nombre,
          tipo: data.tipo,
          profesor: data.profesor || null,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (materiaError) throw materiaError;

      // Eliminar módulos existentes
      const { error: deleteError } = await supabase
        .from('materia_modulos')
        .delete()
        .eq('materia_id', data.id);

      if (deleteError) throw deleteError;

      // Crear los nuevos módulos
      if (data.modulos && data.modulos.length > 0) {
        const modulosData = data.modulos.map(modulo => ({
          materia_id: data.id,
          dia_semana: modulo.dia_semana,
          hora_inicio: modulo.hora_inicio,
          cantidad_modulos: modulo.cantidad_modulos,
          grupo: modulo.grupo
        }));

        const { error: modulosError } = await supabase
          .from('materia_modulos')
          .insert(modulosData);

        if (modulosError) throw modulosError;
      }

      return materia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materias', cursoId] });
      toast({
        title: 'Materia actualizada',
        description: 'La materia se actualizó correctamente.',
      });
    },
    onError: (error) => {
      console.error('Error updating materia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la materia.',
        variant: 'destructive',
      });
    },
  });
};
