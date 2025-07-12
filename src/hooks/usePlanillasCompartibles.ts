
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlanillaCompartible {
  id: string;
  periodo_id: string;
  materia_id: string;
  curso_id: string;
  token_url: string;
  profesor_nombre?: string;
  fecha_completada?: string;
  estado: 'pendiente' | 'completada' | 'enviada_final';
  created_at: string;
  updated_at: string;
  materia?: {
    id: string;
    nombre: string;
    tipo: string;
  };
  periodo?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  curso?: {
    id: string;
    anio: number;
    division: number;
    turno: string;
  };
}

export interface PlanillaCompartibleInput {
  periodo_id: string;
  materia_id: string;
  curso_id: string;
  token_url: string;
}

export const usePlanillasCompartibles = (cursoId: string, periodoId?: string) => {
  return useQuery({
    queryKey: ['planillas-compartibles', cursoId, periodoId],
    queryFn: async () => {
      console.log('Fetching planillas for curso:', cursoId, 'período:', periodoId);
      
      if (!cursoId) {
        console.error('No curso ID provided');
        return [];
      }

      let query = supabase
        .from('planillas_compartibles')
        .select(`
          *,
          materia:materias(id, nombre, tipo),
          periodo:periodos_notas(id, nombre, descripcion),
          curso:cursos(id, anio, division, turno)
        `)
        .eq('curso_id', cursoId);

      if (periodoId) {
        query = query.eq('periodo_id', periodoId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching planillas:', error);
        throw error;
      }

      console.log('Planillas fetched:', data?.length || 0);
      return data as PlanillaCompartible[];
    },
    enabled: !!cursoId,
  });
};

export const usePlanillaByToken = (token: string) => {
  return useQuery({
    queryKey: ['planilla-token', token],
    queryFn: async () => {
      console.log('Fetching planilla by token:', token);
      
      if (!token) {
        throw new Error('No token provided');
      }

      const { data, error } = await supabase
        .from('planillas_compartibles')
        .select(`
          *,
          materia:materias(id, nombre, tipo),
          periodo:periodos_notas(id, nombre, descripcion),
          curso:cursos(id, anio, division, turno)
        `)
        .eq('token_url', token)
        .single();

      if (error) {
        console.error('Error fetching planilla by token:', error);
        throw error;
      }

      console.log('Planilla fetched by token:', data);
      return data;
    },
    enabled: !!token,
  });
};

export const useCreatePlanillaCompartible = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planilla: PlanillaCompartibleInput) => {
      console.log('Creating planilla compartible:', planilla);
      
      const { data, error } = await supabase
        .from('planillas_compartibles')
        .insert([planilla])
        .select()
        .single();

      if (error) {
        console.error('Error creating planilla:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planillas-compartibles'] });
      toast.success('Planilla creada exitosamente');
      console.log('Planilla created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating planilla:', error);
      toast.error('Error al crear la planilla');
    },
  });
};

export const useUpdatePlanillaCompartible = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; profesor_nombre?: string; estado?: string }) => {
      console.log('Updating planilla:', id, updates);
      
      const updateData = {
        ...updates,
        ...(updates.estado === 'completada' && { fecha_completada: new Date().toISOString() })
      };
      
      console.log('Update data being sent:', updateData);
      
      const { data, error } = await supabase
        .from('planillas_compartibles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating planilla:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planillas-compartibles'] });
      queryClient.invalidateQueries({ queryKey: ['planilla-token'] });
      toast.success('Planilla actualizada exitosamente');
      console.log('Planilla updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating planilla:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error('Error al actualizar la planilla');
    },
  });
};

export const useDeletePlanillaCompartible = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting planilla:', id);
      
      const { error } = await supabase
        .from('planillas_compartibles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting planilla:', error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['planillas-compartibles'] });
      toast.success('Planilla eliminada exitosamente');
      console.log('Planilla deleted successfully:', id);
    },
    onError: (error) => {
      console.error('Error deleting planilla:', error);
      toast.error('Error al eliminar la planilla');
    },
  });
};

// Hook para obtener alumnos en planillas públicas (sin autenticación)
export const useAlumnosForPlanilla = (cursoId: string) => {
  return useQuery({
    queryKey: ['alumnos-planilla', cursoId],
    queryFn: async () => {
      console.log('Fetching alumnos for planilla curso:', cursoId);
      
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
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching alumnos for planilla:', error);
        throw error;
      }

      console.log('Alumnos fetched for planilla:', data?.length || 0, 'for curso:', cursoId);
      return data || [];
    },
    enabled: !!cursoId,
  });
};

// Función para generar un token único
export const generateUniqueToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
