
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Materia, TipoMateria } from '@/types/database';

const moduloSchema = z.object({
  dia_semana: z.number().min(1).max(7),
  hora_inicio: z.string().min(1, 'La hora de inicio es requerida'),
  cantidad_modulos: z.number().min(1).max(10),
  grupo: z.enum(['A', 'B', 'todos'] as const),
});

const materiaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.enum(['Clase', 'Taller', 'EF'] as const, {
    required_error: 'El tipo es requerido',
  }),
  profesor: z.string().optional(),
  modulos: z.array(moduloSchema).min(1, 'Debe agregar al menos un módulo horario'),
});

export type MateriaFormData = z.infer<typeof materiaSchema>;

interface UseMateriaFormLogicProps {
  materia?: Materia;
  onSubmit: (data: MateriaFormData) => void;
}

export const useMateriaFormLogic = ({ materia, onSubmit }: UseMateriaFormLogicProps) => {
  const [loadingModulos, setLoadingModulos] = useState(false);

  const form = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
    defaultValues: {
      nombre: materia?.nombre || '',
      tipo: materia?.tipo as TipoMateria || 'Clase',
      profesor: (materia as any)?.profesor || '',
      modulos: [
        { dia_semana: 1, hora_inicio: '08:00', cantidad_modulos: 2, grupo: 'todos' }
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'modulos',
  });

  // Load existing modules when editing a subject
  useEffect(() => {
    const loadExistingModulos = async () => {
      if (!materia?.id) return;

      setLoadingModulos(true);
      try {
        const { data: modulos, error } = await supabase
          .from('materia_modulos')
          .select('*')
          .eq('materia_id', materia.id)
          .order('dia_semana', { ascending: true })
          .order('hora_inicio', { ascending: true });

        if (error) {
          console.error('Error loading modulos:', error);
          return;
        }

        if (modulos && modulos.length > 0) {
          const formattedModulos = modulos.map(modulo => ({
            dia_semana: modulo.dia_semana,
            hora_inicio: modulo.hora_inicio,
            cantidad_modulos: modulo.cantidad_modulos,
            grupo: modulo.grupo as 'A' | 'B' | 'todos'
          }));
          
          console.log('Loading existing modulos:', formattedModulos);
          replace(formattedModulos);
        }
      } catch (error) {
        console.error('Error fetching modulos:', error);
      } finally {
        setLoadingModulos(false);
      }
    };

    loadExistingModulos();
  }, [materia?.id, replace]);

  const handleTipoChange = (value: TipoMateria) => {
    form.setValue('tipo', value);
    
    // Adjust modules based on subject type
    const currentModulos = form.watch('modulos');
    
    if (value === 'Taller') {
      // For workshops, create separate modules for group A and B if they don't exist
      const hasGrupoA = currentModulos.some(m => m.grupo === 'A');
      const hasGrupoB = currentModulos.some(m => m.grupo === 'B');
      const hasTodos = currentModulos.some(m => m.grupo === 'todos');
      
      if (hasTodos || (!hasGrupoA && !hasGrupoB)) {
        form.setValue('modulos', [
          { dia_semana: 1, hora_inicio: '08:00', cantidad_modulos: 2, grupo: 'A' },
          { dia_semana: 1, hora_inicio: '10:00', cantidad_modulos: 2, grupo: 'B' }
        ]);
      }
    } else {
      // For Class and PE, use 'todos' group
      const hasTodos = currentModulos.some(m => m.grupo === 'todos');
      
      if (!hasTodos) {
        form.setValue('modulos', [
          { dia_semana: 1, hora_inicio: '08:00', cantidad_modulos: 2, grupo: 'todos' }
        ]);
      }
    }
  };

  const handleFormSubmit = (data: MateriaFormData) => {
    console.log('Submitting form data:', data);
    onSubmit(data);
  };

  return {
    form,
    fields,
    append,
    remove,
    loadingModulos,
    handleTipoChange,
    handleFormSubmit,
  };
};
