
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PromocionData {
  alumno_id: string;
  curso_destino_id: string;
  observaciones?: string;
}

export const usePromociones = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const promoverAlumno = useMutation({
    mutationFn: async (data: PromocionData) => {
      console.log('Starting student promotion:', data);
      
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener datos del alumno actual
      const { data: alumno, error: alumnoError } = await supabase
        .from('alumnos')
        .select('*')
        .eq('id', data.alumno_id)
        .single();

      if (alumnoError) {
        console.error('Error fetching student:', alumnoError);
        throw alumnoError;
      }

      console.log('Student data:', alumno);

      // Actualizar el curso del alumno
      const { error: updateError } = await supabase
        .from('alumnos')
        .update({ curso_id: data.curso_destino_id })
        .eq('id', data.alumno_id);

      if (updateError) {
        console.error('Error updating student course:', updateError);
        throw updateError;
      }

      // Registrar la promoción en el log
      const { error: logError } = await supabase
        .from('promociones_log')
        .insert({
          alumno_id: data.alumno_id,
          curso_origen_id: alumno.curso_id,
          curso_destino_id: data.curso_destino_id,
          user_id: user.id,
          observaciones: data.observaciones || null,
        });

      if (logError) {
        console.error('Error logging promotion:', logError);
        throw logError;
      }

      console.log('Promotion completed successfully');
      return { alumno, curso_destino_id: data.curso_destino_id };
    },
    onSuccess: (data) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['promociones-log'] });
      
      toast({
        title: "Promoción exitosa",
        description: `${data.alumno.nombre} ${data.alumno.apellido} ha sido promovido exitosamente.`,
      });
    },
    onError: (error) => {
      console.error('Error promoting student:', error);
      toast({
        title: "Error en la promoción",
        description: "No se pudo promover al alumno. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const promoverAlumnosEnLote = useMutation({
    mutationFn: async (promociones: PromocionData[]) => {
      console.log('Starting bulk promotion:', promociones);
      
      if (!user) throw new Error('Usuario no autenticado');

      const results = [];
      
      for (const promocion of promociones) {
        console.log('Processing promotion for student:', promocion.alumno_id);
        
        // Obtener datos del alumno actual
        const { data: alumno, error: alumnoError } = await supabase
          .from('alumnos')
          .select('*')
          .eq('id', promocion.alumno_id)
          .single();

        if (alumnoError) {
          console.error('Error fetching student:', alumnoError);
          throw alumnoError;
        }

        // Actualizar el curso del alumno
        const { error: updateError } = await supabase
          .from('alumnos')
          .update({ curso_id: promocion.curso_destino_id })
          .eq('id', promocion.alumno_id);

        if (updateError) {
          console.error('Error updating student course:', updateError);
          throw updateError;
        }

        // Registrar la promoción en el log
        const { error: logError } = await supabase
          .from('promociones_log')
          .insert({
            alumno_id: promocion.alumno_id,
            curso_origen_id: alumno.curso_id,
            curso_destino_id: promocion.curso_destino_id,
            user_id: user.id,
            observaciones: promocion.observaciones || null,
          });

        if (logError) {
          console.error('Error logging promotion:', logError);
          throw logError;
        }

        results.push({ alumno, curso_destino_id: promocion.curso_destino_id });
      }

      console.log('Bulk promotion completed successfully');
      return results;
    },
    onSuccess: (results) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['promociones-log'] });
      
      toast({
        title: "Promoción masiva exitosa",
        description: `Se promovieron ${results.length} alumnos exitosamente.`,
      });
    },
    onError: (error) => {
      console.error('Error in bulk promotion:', error);
      toast({
        title: "Error en la promoción masiva",
        description: "No se pudieron promover todos los alumnos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  return {
    promoverAlumno,
    promoverAlumnosEnLote,
  };
};

export const usePromocionesLog = (alumnoId?: string) => {
  return useQuery({
    queryKey: ['promociones-log', alumnoId],
    queryFn: async () => {
      console.log('Fetching promotion logs for student:', alumnoId);
      
      let query = supabase
        .from('promociones_log')
        .select(`
          *,
          curso_origen:cursos!curso_origen_id(anio, division, turno),
          curso_destino:cursos!curso_destino_id(anio, division, turno)
        `)
        .order('fecha_promocion', { ascending: false });

      if (alumnoId) {
        query = query.eq('alumno_id', alumnoId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching promotion logs:', error);
        throw error;
      }
      
      console.log('Promotion logs fetched:', data?.length || 0);
      return data || [];
    },
    enabled: true,
  });
};
