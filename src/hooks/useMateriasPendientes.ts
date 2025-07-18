import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CalificadorTab } from './tabs/CalificadorTab';

export const useMateriasPendientes = (cursoId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['materias-pendientes', cursoId],
    queryFn: async () => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Fetching materias pendientes for curso:', cursoId);

      // Primero obtener los IDs de alumnos del curso
      const { data: alumnos, error: errorAlumnos } = await supabase
        .from('alumnos')
        .select('id')
        .eq('curso_id', cursoId);

      if (errorAlumnos) {
        console.error('Error fetching alumnos del curso:', errorAlumnos);
        throw errorAlumnos;
      }

      if (!alumnos || alumnos.length === 0) {
        console.log('No hay alumnos en el curso');
        return [];
      }

      const alumnoIds = alumnos.map(a => a.id);
      console.log('IDs de alumnos del curso:', alumnoIds);

      // Obtener las materias pendientes de estos alumnos
      const { data: materiasPendientes, error: errorMP } = await supabase
        .from('materias_pendientes')
        .select('*')
        .in('alumno_id', alumnoIds);

      if (errorMP) {
        console.error('Error fetching materias pendientes:', errorMP);
        throw errorMP;
      }

      console.log('Materias pendientes básicas:', materiasPendientes);

      if (!materiasPendientes || materiasPendientes.length === 0) {
        console.log('No hay materias pendientes para estos alumnos');
        return [];
      }

      // Obtener información completa de alumnos
      const { data: alumnosCompletos, error: errorAlumnosCompletos } = await supabase
        .from('alumnos')
        .select('id, nombre, apellido, curso_id')
        .in('id', alumnoIds);

      if (errorAlumnosCompletos) {
        console.error('Error fetching alumnos completos:', errorAlumnosCompletos);
        throw errorAlumnosCompletos;
      }

      // Obtener información de materias originales
      const materiaOriginalIds = materiasPendientes
        .map(mp => mp.materia_original_id)
        .filter(id => id !== null);
      
      const { data: materiasOriginales, error: errorMateriasOriginales } = await supabase
        .from('materias')
        .select('id, nombre, curso_id')
        .in('id', materiaOriginalIds);

      if (errorMateriasOriginales) {
        console.error('Error fetching materias originales:', errorMateriasOriginales);
        throw errorMateriasOriginales;
      }

      // Obtener información de materias vinculadas
      const materiaVinculadaIds = materiasPendientes
        .map(mp => mp.materia_destino_id)
        .filter(id => !!id);

      let materiasVinculadas = [];
      if (materiaVinculadaIds.length > 0) {
        const { data, error: errorMateriasVinculadas } = await supabase
          .from('materias')
          .select('id, nombre, curso_id')
          .in('id', materiaVinculadaIds);

        if (errorMateriasVinculadas) {
          console.error('Error fetching materias vinculadas:', errorMateriasVinculadas);
          throw errorMateriasVinculadas;
        }
        materiasVinculadas = data || [];
      }

      // Combinar toda la información
      const materiasPendientesCompletas = materiasPendientes.map(mp => ({
        ...mp,
        alumno: alumnosCompletos?.find(a => a.id === mp.alumno_id),
        materia_original: materiasOriginales?.find(m => m.id === mp.materia_original_id),
        materia_vinculada: materiasVinculadas?.find(m => m.id === mp.materia_destino_id)
      }));

      console.log('Materias pendientes completas:', materiasPendientesCompletas);
      return materiasPendientesCompletas;
    },
    enabled: !!user && !!cursoId,
  });
};

export const useVincularMateria = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      materiaPendienteId,
      materiaDestinoId,
      tipo,
      contenidosPendientes,
    }: {
      materiaPendienteId: string;
      materiaDestinoId: string;
      tipo: 'intensificacion' | 'recursa';
      contenidosPendientes?: string;
    }) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('materias_pendientes')
        .update({
          materia_destino_id: materiaDestinoId,
          tipo: tipo,
          contenidos_pendientes: contenidosPendientes || null,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', materiaPendienteId)
        .select()
        .single();

      if (error) {
        console.error('Error vinculando materia:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Materia vinculada exitosamente",
        description: "La materia pendiente ha sido vinculada para intensificación o recursa",
      });
      queryClient.invalidateQueries({ queryKey: ['materias-pendientes'] });
    },
    onError: (error) => {
      toast({
        title: "Error al vincular materia",
        description: "No se pudo vincular la materia pendiente",
        variant: "destructive",
      });
    },
  });
};

export const useCrearMateriaPendiente = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alumnoId,
      materiaOriginalId,
      cursoOrigenId,
      cursoDestinoId,
      anioLectivo,
      observaciones,
      materiaDestinoId,
      tipo,
    }: {
      alumnoId: string;
      materiaOriginalId: string;
      cursoOrigenId: string;
      cursoDestinoId: string;
      anioLectivo: number;
      observaciones?: string;
      materiaDestinoId?: string;
      tipo: 'intensificacion' | 'recursa';
    }) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('materias_pendientes')
        .insert({
          alumno_id: alumnoId,
          materia_original_id: materiaOriginalId,
          curso_origen_id: cursoOrigenId,
          curso_destino_id: cursoDestinoId,
          materia_destino_id: materiaDestinoId || null,
          tipo: tipo,
          contenidos_pendientes: observaciones || null,
          anio_lectivo: anioLectivo,
          estado: 'pendiente',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando materia pendiente:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Materia pendiente creada",
        description: "La materia pendiente ha sido registrada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['materias-pendientes'] });
    },
    onError: (error) => {
      toast({
        title: "Error al crear materia pendiente",
        description: "No se pudo registrar la materia pendiente",
        variant: "destructive",
      });
    },
  });
}; 

export const useEliminarMateriaPendiente = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materiaPendienteId: string) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Eliminando materia pendiente:', materiaPendienteId);

      const { error } = await supabase
        .from('materias_pendientes')
        .delete()
        .eq('id', materiaPendienteId);

      if (error) {
        console.error('Error eliminando materia pendiente:', error);
        throw error;
      }

      console.log('Materia pendiente eliminada exitosamente');
    },
    onSuccess: () => {
      toast({
        title: "Materia pendiente eliminada",
        description: "La materia pendiente ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['materias-pendientes'] });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar materia pendiente",
        description: "No se pudo eliminar la materia pendiente",
        variant: "destructive",
      });
    },
  });
}; 

export const useActualizarEstadoMateria = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      materiaPendienteId,
      estado,
      notaFinal,
    }: {
      materiaPendienteId: string;
      estado: 'aprobada' | 'pendiente' | 'en_curso';
      notaFinal?: number;
    }) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('materias_pendientes')
        .update({
          estado,
          nota_final: notaFinal,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', materiaPendienteId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando estado de materia:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Materia actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['materias-pendientes'] });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar materia",
        description: "No se pudo actualizar el estado de la materia",
        variant: "destructive",
      });
    },
  });
}; 