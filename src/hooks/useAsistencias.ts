
// Re-export all functions from the refactored modules
export { 
  useAsistencias, 
  useAsistenciasPorCurso, 
  useAsistenciasLog 
} from './useAsistenciasQueries';

export { 
  useCreateAsistencia, 
  useUpdateAsistencia, 
  useBulkUpdateAsistencias 
} from './useAsistenciasMutations';
