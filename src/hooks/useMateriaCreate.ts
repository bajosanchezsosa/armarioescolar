
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMateriaCreate = (cursoId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
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

      // Crear la materia primero
      const { data: materia, error: materiaError } = await supabase
        .from('materias')
        .insert([{
          nombre: data.nombre,
          tipo: data.tipo,
          profesor: data.profesor || null,
          curso_id: cursoId
        }])
        .select()
        .single();

      if (materiaError) throw materiaError;

      // Crear los módulos asociados
      if (data.modulos && data.modulos.length > 0) {
        const modulosData = data.modulos.map(modulo => ({
          materia_id: materia.id,
          dia_semana: modulo.dia_semana,
          hora_inicio: modulo.hora_inicio,
          cantidad_modulos: modulo.cantidad_modulos,
          grupo: modulo.grupo
        }));

        const { error: modulosError } = await supabase
          .from('materia_modulos')
          .insert(modulosData);

        if (modulosError) {
          // Si falla la creación de módulos, eliminar la materia creada
          await supabase.from('materias').delete().eq('id', materia.id);
          throw modulosError;
        }
      }

      return materia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materias', cursoId] });
      toast({
        title: 'Materia creada',
        description: 'La materia se creó correctamente con sus módulos horarios.',
      });
    },
    onError: (error) => {
      console.error('Error creating materia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la materia.',
        variant: 'destructive',
      });
    },
  });
};
