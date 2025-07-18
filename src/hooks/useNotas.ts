

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Nota {
  id: string;
  alumno_id: string;
  materia_id: string;
  curso_id: string;
  periodo_id?: string;
  nota?: string;
  tipo_evaluacion: string;
  observaciones?: string;
  fecha: string;
  created_at: string;
  updated_at: string;
  alumno?: {
    nombre: string;
    apellido: string;
  };
  materia?: {
    nombre: string;
  };
}

export interface NotaInput {
  alumno_id: string;
  materia_id: string;
  curso_id: string;
  periodo_id?: string;
  nota?: string;
  tipo_evaluacion: string;
  observaciones?: string;
  fecha: string;
}

export const useNotas = (cursoId: string, materiaId?: string, periodoId?: string) => {
  return useQuery({
    queryKey: ['notas', cursoId, materiaId, periodoId],
    queryFn: async () => {
      console.log('Fetching notas for curso:', cursoId, 'materia:', materiaId, 'periodo:', periodoId);
      
      let query = supabase
        .from('notas')
        .select(`
          *,
          alumno:alumnos(nombre, apellido),
          materia:materias(nombre)
        `)
        .eq('curso_id', cursoId);

      if (materiaId) {
        query = query.eq('materia_id', materiaId);
      }

      if (periodoId) {
        query = query.eq('periodo_id', periodoId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notas:', error);
        throw error;
      }

      console.log('Notas fetched:', data?.length || 0);
      return data as Nota[];
    },
    enabled: !!cursoId,
  });
};

export const useCreateNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nota: NotaInput) => {
      console.log('Creating nota:', nota);
      
      const { data, error } = await supabase
        .from('notas')
        .insert([nota])
        .select()
        .single();

      if (error) {
        console.error('Error creating nota:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      console.log('Nota created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating nota:', error);
      toast.error('Error al crear la nota');
    },
  });
};

export const useUpdateNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotaInput> & { id: string }) => {
      console.log('Updating nota:', id, updates);
      
      const { data, error } = await supabase
        .from('notas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating nota:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      console.log('Nota updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating nota:', error);
      toast.error('Error al actualizar la nota');
    },
  });
};

export const useDeleteNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting nota:', id);
      
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting nota:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      toast.success('Nota eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting nota:', error);
      toast.error('Error al eliminar la nota');
    },
  });
};

export const useBulkCreateNotas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notas: NotaInput[]) => {
      console.log('Creating bulk notas:', notas.length);
      
      const { data, error } = await supabase
        .from('notas')
        .insert(notas)
        .select();

      if (error) {
        console.error('Error creating bulk notas:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      console.log('Bulk notas created successfully:', data?.length || 0);
    },
    onError: (error) => {
      console.error('Error creating bulk notas:', error);
      toast.error('Error al crear las notas');
    },
  });
};

export const useNotasPorAlumno = (cursoId: string, alumnoId: string) => {
  return useQuery({
    queryKey: ['notas-alumno', cursoId, alumnoId],
    queryFn: async () => {
      console.log('Fetching notas for alumno:', alumnoId, 'curso:', cursoId);
      
      const { data, error } = await supabase
        .from('notas')
        .select(`
          *,
          alumno:alumnos(nombre, apellido),
          materia:materias(nombre),
          periodo:periodos_notas(nombre, descripcion)
        `)
        .eq('curso_id', cursoId)
        .eq('alumno_id', alumnoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notas por alumno:', error);
        throw error;
      }

      console.log('Notas del alumno fetched:', data?.length || 0);
      return data as (Nota & { periodo?: { nombre: string; descripcion?: string } })[];
    },
    enabled: !!cursoId && !!alumnoId,
  });
};
