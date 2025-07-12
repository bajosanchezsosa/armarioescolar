
import React, { useState } from 'react';
import { Nota } from '@/hooks/useNotas';
import { NotasFilters } from './NotasFilters';
import { NotasStats } from './NotasStats';
import { NotasTableView } from './NotasTableView';

interface NotasTableProps {
  notas: Nota[];
  materias: any[];
  onEdit: (nota: Nota) => void;
  onEditNotaFinal?: (nota: Nota) => void;
}

export const NotasTable = ({ notas, materias, onEdit, onEditNotaFinal }: NotasTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materiaFilter, setMateriaFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');

  const filteredNotas = notas.filter(nota => {
    const matchesSearch = searchTerm === '' || 
      `${nota.alumno?.apellido} ${nota.alumno?.nombre}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.materia?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMateria = materiaFilter === 'all' || nota.materia_id === materiaFilter;
    const matchesTipo = tipoFilter === 'all' || nota.tipo_evaluacion === tipoFilter;
    
    return matchesSearch && matchesMateria && matchesTipo;
  });

  return (
    <div className="space-y-4">
      <NotasFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        materiaFilter={materiaFilter}
        setMateriaFilter={setMateriaFilter}
        tipoFilter={tipoFilter}
        setTipoFilter={setTipoFilter}
        materias={materias}
      />

      <NotasStats notas={filteredNotas} />

      <NotasTableView 
        notas={filteredNotas}
        onEdit={onEdit}
        onEditNotaFinal={onEditNotaFinal}
      />
    </div>
  );
};
