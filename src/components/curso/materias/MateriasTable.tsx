
import React, { useState } from 'react';
import { Materia, MateriaModulo } from '@/types/database';
import { MateriaCard } from './MateriaCard';

interface MateriasTableProps {
  materias: Materia[];
  onEditMateria: (materia: Materia) => void;
  onDeleteMateria: (materia: Materia) => void;
  onAddModulo: (materiaId: string) => void;
  onEditModulo: (modulo: MateriaModulo) => void;
  onDeleteModulo: (modulo: MateriaModulo) => void;
}

export const MateriasTable = ({
  materias,
  onEditMateria,
  onDeleteMateria,
  onAddModulo,
  onEditModulo,
  onDeleteModulo,
}: MateriasTableProps) => {
  const [expandedMaterias, setExpandedMaterias] = useState<Set<string>>(new Set());

  const toggleExpanded = (materiaId: string) => {
    const newExpanded = new Set(expandedMaterias);
    if (newExpanded.has(materiaId)) {
      newExpanded.delete(materiaId);
    } else {
      newExpanded.add(materiaId);
    }
    setExpandedMaterias(newExpanded);
  };

  if (materias.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay materias registradas en este curso.</p>
        <p className="text-sm">Utiliza el botón "Agregar Materia" para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materias.map((materia) => (
        <MateriaCard
          key={materia.id}
          materia={materia}
          isExpanded={expandedMaterias.has(materia.id)}
          onToggleExpanded={() => toggleExpanded(materia.id)}
          onEditMateria={onEditMateria}
          onDeleteMateria={onDeleteMateria}
          onAddModulo={onAddModulo}
          onEditModulo={onEditModulo}
          onDeleteModulo={onDeleteModulo}
        />
      ))}
    </div>
  );
};
