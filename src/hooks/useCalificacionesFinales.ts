import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalificacionFinal {
  id: string;
  alumno_id: string;
  materia_id: string;
  curso_id: string;
  anio_lectivo: number;
  cuatrimestre_1?: string;
  cuatrimestre_2?: string;
  promedio_anual?: string;
  diciembre?: string;
  marzo?: string;
  calificacion_definitiva?: string;
  estado: 'aprobada' | 'pendiente' | 'intensifica' | 'recursa';
  observaciones?: string;
  creado_por_id: string;
  creado_en: string;
  actualizado_en: string;
}

export interface CalificacionFinalInput {
  alumno_id: string;
  materia_id: string;
  curso_id: string;
  anio_lectivo: number;
  cuatrimestre_1?: string;
  cuatrimestre_2?: string;
  promedio_anual?: string;
  diciembre?: string;
  marzo?: string;
  calificacion_definitiva?: string;
  estado: 'aprobada' | 'pendiente' | 'intensifica' | 'recursa';
  observaciones?: string;
}

export const useCalificacionesFinales = (cursoId: string, anioLectivo?: number) => {
  return useQuery({
    queryKey: ['calificaciones-finales', cursoId, anioLectivo],
    queryFn: async () => {
      console.log('Fetching calificaciones finales for curso:', cursoId, 'año:', anioLectivo);
      
      let query = supabase
        .from('calificaciones_finales')
        .select('*')
        .eq('curso_id', cursoId);

      if (anioLectivo) {
        query = query.eq('anio_lectivo', anioLectivo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching calificaciones finales:', error);
        throw error;
      }

      console.log('Calificaciones finales fetched:', data?.length || 0);
      return data as CalificacionFinal[];
    },
    enabled: !!cursoId,
  });
};

export const useCreateOrUpdateCalificacionFinal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CalificacionFinalInput) => {
      console.log('Creating/updating calificación final:', input);
      
      // Verificar si ya existe una calificación para este alumno y materia
      const { data: existing, error: checkError } = await supabase
        .from('calificaciones_finales')
        .select('id')
        .eq('alumno_id', input.alumno_id)
        .eq('materia_id', input.materia_id)
        .eq('anio_lectivo', input.anio_lectivo)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing calificación:', checkError);
        throw checkError;
      }

      if (existing) {
        // Actualizar registro existente
        const { data, error } = await supabase
          .from('calificaciones_finales')
          .update({
            ...input,
            actualizado_en: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating calificación final:', error);
          throw error;
        }

        return data;
      } else {
        // Crear nuevo registro
        const { data, error } = await supabase
          .from('calificaciones_finales')
          .insert([{
            ...input,
            creado_por_id: (await supabase.auth.getUser()).data.user?.id
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating calificación final:', error);
          throw error;
        }

        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-finales'] });
      toast.success('Calificación final guardada exitosamente');
      console.log('Calificación final saved successfully:', data);
    },
    onError: (error) => {
      console.error('Error saving calificación final:', error);
      toast.error('Error al guardar la calificación final');
    },
  });
};

export const useBulkCreateCalificacionesFinales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: CalificacionFinalInput[]) => {
      console.log('Creating bulk calificaciones finales:', inputs.length);
      
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      // Preparar datos para inserción masiva
      const calificacionesParaInsertar = [];
      const calificacionesParaActualizar = [];

      for (const input of inputs) {
        // Verificar si ya existe
        const { data: existing, error: checkError } = await supabase
          .from('calificaciones_finales')
          .select('id')
          .eq('alumno_id', input.alumno_id)
          .eq('materia_id', input.materia_id)
          .eq('anio_lectivo', input.anio_lectivo)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing calificación:', checkError);
          throw checkError;
        }

        if (existing) {
          calificacionesParaActualizar.push({
            id: existing.id,
            ...input,
            actualizado_en: new Date().toISOString()
          });
        } else {
          calificacionesParaInsertar.push({
            ...input,
            creado_por_id: userId
          });
        }
      }

      const results = [];

      // Insertar nuevas calificaciones
      if (calificacionesParaInsertar.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('calificaciones_finales')
          .insert(calificacionesParaInsertar)
          .select();

        if (insertError) {
          console.error('Error inserting calificaciones:', insertError);
          throw insertError;
        }

        results.push(...(insertData || []));
      }

      // Actualizar calificaciones existentes
      for (const calificacion of calificacionesParaActualizar) {
        const { id, ...updateData } = calificacion;
        const { data: updateResult, error: updateError } = await supabase
          .from('calificaciones_finales')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating calificación:', updateError);
          throw updateError;
        }

        results.push(updateResult);
      }

      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-finales'] });
      toast.success(`${data.length} calificaciones finales enviadas exitosamente`);
      console.log('Bulk calificaciones finales saved successfully:', data.length);
    },
    onError: (error) => {
      console.error('Error saving bulk calificaciones finales:', error);
      toast.error('Error al enviar las calificaciones finales');
    },
  });
};