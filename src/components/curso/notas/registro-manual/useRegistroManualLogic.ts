
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNotas, useBulkCreateNotas, useUpdateNota, NotaInput } from '@/hooks/useNotas';

interface UseRegistroManualLogicProps {
  cursoId: string;
  periodoId: string;
}

export const useRegistroManualLogic = ({ cursoId, periodoId }: UseRegistroManualLogicProps) => {
  const [notasData, setNotasData] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { data: notasExistentes = [] } = useNotas(cursoId, undefined, periodoId);
  const bulkCreateNotas = useBulkCreateNotas();
  const updateNota = useUpdateNota();

  // Función para crear una clave única que no se confunda con UUIDs
  const createKey = (alumnoId: string, materiaId: string) => {
    return `${alumnoId}__${materiaId}`;
  };

  // Función para parsear la clave y extraer los IDs
  const parseKey = (key: string): [string, string] => {
    const parts = key.split('__');
    if (parts.length !== 2) {
      console.error('Invalid key format:', key);
      return ['', ''];
    }
    return [parts[0], parts[1]];
  };

  // Cargar notas existentes
  useEffect(() => {
    const notasMap: { [key: string]: string } = {};
    notasExistentes.forEach(nota => {
      const key = createKey(nota.alumno_id, nota.materia_id);
      notasMap[key] = nota.nota || '';
    });
    setNotasData(notasMap);
  }, [notasExistentes]);

  const handleNotaChange = (alumnoId: string, materiaId: string, value: string) => {
    const key = createKey(alumnoId, materiaId);
    setNotasData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getNotaValue = (alumnoId: string, materiaId: string) => {
    const key = createKey(alumnoId, materiaId);
    return notasData[key] || '';
  };

  const getExistingNota = (alumnoId: string, materiaId: string) => {
    return notasExistentes.find(n => n.alumno_id === alumnoId && n.materia_id === materiaId);
  };

  const getNotaStatus = (alumnoId: string, materiaId: string) => {
    const value = getNotaValue(alumnoId, materiaId);
    if (!value) return 'empty';
    
    // Evaluar si está aprobado (simplificado)
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return numericValue >= 6 ? 'approved' : 'failed';
    }
    
    // Para notas alfabéticas
    if (['A', 'B', 'C'].includes(value.toUpperCase())) {
      return 'approved';
    }
    
    return 'neutral';
  };

  const handleSave = async (materias: any[]) => {
    setIsLoading(true);
    try {
      const notasParaCrear: NotaInput[] = [];
      const notasParaActualizar: Array<{ id: string; nota: string }> = [];

      console.log('Datos disponibles para guardar:', {
        materias: materias.length,
        notasData: Object.keys(notasData).length,
        cursoId,
        periodoId
      });

      // Procesar cambios
      Object.entries(notasData).forEach(([key, value]) => {
        if (!value.trim()) return;

        const [alumnoId, materiaId] = parseKey(key);
        
        console.log('Procesando key:', key, 'value:', value, 'alumnoId:', alumnoId, 'materiaId:', materiaId);
        
        // Validar que los IDs sean UUIDs válidos (36 caracteres con guiones)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!alumnoId || !materiaId || !uuidRegex.test(alumnoId) || !uuidRegex.test(materiaId)) {
          console.error('Invalid UUID format:', { 
            alumnoId, 
            materiaId, 
            key,
            alumnoIdValid: uuidRegex.test(alumnoId || ''),
            materiaIdValid: uuidRegex.test(materiaId || '')
          });
          return;
        }
        
        const notaExistente = getExistingNota(alumnoId, materiaId);

        if (notaExistente) {
          // Actualizar nota existente si cambió
          if (notaExistente.nota !== value.trim()) {
            notasParaActualizar.push({
              id: notaExistente.id,
              nota: value.trim()
            });
          }
        } else {
          // Crear nueva nota
          const notaInput: NotaInput = {
            alumno_id: alumnoId,
            materia_id: materiaId,
            curso_id: cursoId,
            periodo_id: periodoId,
            tipo_evaluacion: 'Parcial',
            nota: value.trim(),
            fecha: format(new Date(), 'yyyy-MM-dd'),
            observaciones: 'Cargado manualmente'
          };
          
          console.log('Nota a crear:', notaInput);
          notasParaCrear.push(notaInput);
        }
      });

      console.log('Resumen:', {
        notasParaCrear: notasParaCrear.length,
        notasParaActualizar: notasParaActualizar.length
      });

      // Ejecutar cambios
      const promises = [];

      if (notasParaCrear.length > 0) {
        promises.push(bulkCreateNotas.mutateAsync(notasParaCrear));
      }

      for (const nota of notasParaActualizar) {
        promises.push(updateNota.mutateAsync(nota));
      }

      await Promise.all(promises);

      toast.success(`Registro guardado exitosamente. ${notasParaCrear.length} notas creadas, ${notasParaActualizar.length} actualizadas.`);
    } catch (error) {
      console.error('Error saving registro:', error);
      toast.error('Error al guardar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notasData,
    isLoading,
    handleNotaChange,
    getNotaValue,
    getNotaStatus,
    handleSave
  };
};
