
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface MateriasLoadingStateProps {
  isLoading: boolean;
  error: Error | null;
}

export const MateriasLoadingState = ({ isLoading, error }: MateriasLoadingStateProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando materias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>Error al cargar las materias</span>
        </div>
      </div>
    );
  }

  return null;
};
