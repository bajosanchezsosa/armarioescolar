
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, List } from 'lucide-react';

interface MateriasTabHeaderProps {
  materiasCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateMateria: () => void;
}

export const MateriasTabHeader = ({
  materiasCount,
  viewMode,
  onViewModeChange,
  onCreateMateria,
}: MateriasTabHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Materias</h2>
        <p className="text-gray-600">
          Administra las materias y sus módulos horarios ({materiasCount} materias registradas)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="flex items-center gap-1"
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grilla</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </Button>
        </div>
        <Button onClick={onCreateMateria} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Materia
        </Button>
      </div>
    </div>
  );
};
