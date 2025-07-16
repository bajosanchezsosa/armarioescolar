
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
      console.log(`=== DEBUG MUTACIÓN ASISTENCIAS (UPSERT) ===`);
      console.log(`Datos recibidos:`, asistencias);

      // Preparamos los datos para update/insert
      const results = [];
      for (const asistencia of asistencias) {
        // Buscar si ya existe el registro
        const { data: existing, error: selectError } = await supabase
          .from('asistencias')
          .select('id')
          .eq('alumno_id', asistencia.alumnoId)
          .eq('materia_id', asistencia.materiaId)
          .eq('fecha', asistencia.fecha)
          .maybeSingle();
        if (selectError) {
          console.error('❌ Error consultando asistencia existente:', selectError);
          results.push({ error: selectError });
          continue;
        }
        if (existing) {
          // Si existe, actualizar solo el campo estado
          const { data: updateData, error: updateError } = await supabase
            .from('asistencias')
            .update({ estado: asistencia.estado })
            .eq('id', existing.id);
          if (updateError) {
            console.error('❌ Error actualizando asistencia:', updateError);
            results.push({ error: updateError });
          } else {
            results.push({ data: updateData });
          }
        } else {
          // Si no existe, insertar el registro completo
          const { data: insertData, error: insertError } = await supabase
            .from('asistencias')
            .insert({
              alumno_id: asistencia.alumnoId,
              materia_id: asistencia.materiaId,
              fecha: asistencia.fecha,
              estado: asistencia.estado,
              user_id: asistencia.userId,
            });
          if (insertError) {
            console.error('❌ Error insertando asistencia:', insertError);
            results.push({ error: insertError });
          } else {
            results.push({ data: insertData });
          }
        }
      }

      if (results.some(r => r.error)) {
        console.error('Error en upsert de asistencias:', results.find(r => r.error)?.error);
        throw results.find(r => r.error)?.error || new Error('Error desconocido en upsert de asistencias');
      }

      // Crear log entry después de actualizar asistencias
      if (asistencias.length > 0 && user) {
        const { materiaId, fecha, cursoId } = asistencias[0];
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

      // Al final de la mutación, devolver solo los datos exitosos (array plano)
      return results.filter(r => r.data).map(r => r.data).flat();
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        const { materiaId, fecha, cursoId } = variables[0];
        // Invalidar todas las queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['asistencias', materiaId, fecha] });
        queryClient.invalidateQueries({ queryKey: ['asistencias-curso'] });
        queryClient.invalidateQueries({ queryKey: ['asistencias-log', cursoId, materiaId, fecha] });
        queryClient.invalidateQueries({ queryKey: ['registro-general'] });
        queryClient.invalidateQueries({ queryKey: ['registro-anual'] });
        queryClient.invalidateQueries({ queryKey: ['asistencias'] });
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
