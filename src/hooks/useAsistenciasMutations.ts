
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EstadoAsistencia } from '@/types/database';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCreateAsistencia = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newAsistencia: TablesInsert<'asistencias'>) => {
      const { data, error } = await supabase
        .from('asistencias')
        .insert(newAsistencia)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['asistencias', data.materia_id, data.fecha] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar la asistencia.",
        variant: "destructive",
      });
      console.error('Error creating asistencia:', error);
    },
  });
};

export const useUpdateAsistencia = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'asistencias'> }) => {
      const { data, error } = await supabase
        .from('asistencias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['asistencias', data.materia_id, data.fecha] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la asistencia.",
        variant: "destructive",
      });
      console.error('Error updating asistencia:', error);
    },
  });
};

export const useBulkUpdateAsistencias = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (asistencias: Array<{ alumnoId: string; materiaId: string; fecha: string; estado: EstadoAsistencia; userId: string; cursoId: string }>) => {
      const updates = asistencias.map(async (asistencia) => {
        // Check if attendance record exists
        const { data: existing } = await supabase
          .from('asistencias')
          .select('id')
          .eq('alumno_id', asistencia.alumnoId)
          .eq('materia_id', asistencia.materiaId)
          .eq('fecha', asistencia.fecha)
          .single();

        if (existing) {
          // Update existing record
          return supabase
            .from('asistencias')
            .update({ estado: asistencia.estado })
            .eq('id', existing.id);
        } else {
          // Create new record
          return supabase
            .from('asistencias')
            .insert({
              alumno_id: asistencia.alumnoId,
              materia_id: asistencia.materiaId,
              fecha: asistencia.fecha,
              estado: asistencia.estado,
              user_id: asistencia.userId,
            });
        }
      });

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} attendance records`);
      }

      // Create log entry after successful attendance update
      if (asistencias.length > 0 && user) {
        const { materiaId, fecha, cursoId } = asistencias[0];
        
        // Get user name from user_metadata or use email as fallback
        const userName = user.user_metadata?.nombre || user.email?.split('@')[0] || 'Usuario';
        
        await supabase
          .from('asistencias_log')
          .insert({
            curso_id: cursoId,
            materia_id: materiaId,
            fecha: fecha,
            user_id: user.id,
            user_nombre: userName,
          });
      }

      return results;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        const { materiaId, fecha, cursoId } = variables[0];
        queryClient.invalidateQueries({ 
          queryKey: ['asistencias', materiaId, fecha] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['asistencias-curso'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['asistencias-log', cursoId, materiaId, fecha] 
        });
      }
      toast({
        title: "Asistencias guardadas",
        description: "Las asistencias han sido actualizadas correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar todas las asistencias.",
        variant: "destructive",
      });
      console.error('Error bulk updating asistencias:', error);
    },
  });
};
