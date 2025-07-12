
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Acta, ActaConAlumnos, TipoActa, PrioridadActa } from '@/types/database';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useActas = (cursoId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['actas', cursoId],
    queryFn: async (): Promise<ActaConAlumnos[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('actas')
        .select(`
          *,
          acta_alumnos (
            *,
            alumnos (*)
          )
        `)
        .eq('curso_id', cursoId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!cursoId,
  });
};

export interface CreateActaData {
  titulo: string;
  descripcion: string;
  tipo: TipoActa;
  prioridad: PrioridadActa;
  fecha: string;
  curso_id: string;
  alumno_ids: string[];
}

export const useCreateActa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateActaData) => {
      if (!user) throw new Error('Usuario no autenticado');

      // Crear el acta
      const { data: acta, error: actaError } = await supabase
        .from('actas')
        .insert({
          titulo: data.titulo,
          descripcion: data.descripcion,
          tipo: data.tipo,
          prioridad: data.prioridad,
          fecha: data.fecha,
          curso_id: data.curso_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (actaError) throw actaError;

      // Si hay alumnos seleccionados, crear las relaciones
      if (data.alumno_ids.length > 0) {
        const actaAlumnos = data.alumno_ids.map(alumno_id => ({
          acta_id: acta.id,
          alumno_id,
        }));

        const { error: relationError } = await supabase
          .from('acta_alumnos')
          .insert(actaAlumnos);

        if (relationError) throw relationError;
      }

      return acta;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['actas', data.curso_id] });
      toast({
        title: "Acta creada",
        description: `El acta "${data.titulo}" ha sido registrada exitosamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el acta. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error creating acta:', error);
    },
  });
};

export const useUpdateActa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      alumno_ids 
    }: { 
      id: string; 
      updates: TablesUpdate<'actas'>; 
      alumno_ids?: string[];
    }) => {
      // Actualizar el acta
      const { data, error } = await supabase
        .from('actas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Si se proporcionaron alumno_ids, actualizar las relaciones
      if (alumno_ids !== undefined) {
        // Eliminar relaciones existentes
        await supabase
          .from('acta_alumnos')
          .delete()
          .eq('acta_id', id);

        // Crear nuevas relaciones si hay alumnos
        if (alumno_ids.length > 0) {
          const actaAlumnos = alumno_ids.map(alumno_id => ({
            acta_id: id,
            alumno_id,
          }));

          const { error: relationError } = await supabase
            .from('acta_alumnos')
            .insert(actaAlumnos);

          if (relationError) throw relationError;
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['actas', data.curso_id] });
      toast({
        title: "Acta actualizada",
        description: `El acta "${data.titulo}" ha sido actualizada.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el acta. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error updating acta:', error);
    },
  });
};

export const useDeleteActa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('actas')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['actas', data.curso_id] });
      toast({
        title: "Acta eliminada",
        description: `El acta "${data.titulo}" ha sido eliminada.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el acta. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error deleting acta:', error);
    },
  });
};
