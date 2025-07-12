
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alumno } from '@/types/database';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAlumnos = (cursoId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['alumnos', cursoId],
    queryFn: async (): Promise<Alumno[]> => {
      console.log('Fetching alumnos for curso:', cursoId);
      
      if (!cursoId) {
        console.error('No curso ID provided');
        return [];
      }

      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('activo', true)
        .order('apellido', { ascending: true })
        .order('nombre', { ascending: true }); // Secondary sort by name

      if (error) {
        console.error('Error fetching alumnos:', error);
        throw error;
      }

      console.log('Alumnos fetched:', data?.length || 0, 'for curso:', cursoId);
      return data || [];
    },
    enabled: !!cursoId,
  });
};

export const useCreateAlumno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newAlumno: TablesInsert<'alumnos'>) => {
      const { data, error } = await supabase
        .from('alumnos')
        .insert(newAlumno)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alumnos', data.curso_id] });
      toast({
        title: "Alumno agregado",
        description: `${data.nombre} ${data.apellido} ha sido agregado exitosamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el alumno. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error creating alumno:', error);
    },
  });
};

export const useUpdateAlumno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'alumnos'> }) => {
      const { data, error } = await supabase
        .from('alumnos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alumnos', data.curso_id] });
      toast({
        title: "Alumno actualizado",
        description: `Los datos de ${data.nombre} ${data.apellido} han sido actualizados.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el alumno. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error updating alumno:', error);
    },
  });
};

export const useDeleteAlumno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - set activo to false
      const { data, error } = await supabase
        .from('alumnos')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alumnos', data.curso_id] });
      toast({
        title: "Alumno eliminado",
        description: `${data.nombre} ${data.apellido} ha sido eliminado del curso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el alumno. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error('Error deleting alumno:', error);
    },
  });
};
