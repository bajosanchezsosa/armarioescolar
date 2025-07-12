
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface NotasFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  materiaFilter: string;
  setMateriaFilter: (value: string) => void;
  tipoFilter: string;
  setTipoFilter: (value: string) => void;
  materias: any[];
}

export const NotasFilters = ({
  searchTerm,
  setSearchTerm,
  materiaFilter,
  setMateriaFilter,
  tipoFilter,
  setTipoFilter,
  materias
}: NotasFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por alumno o materia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={materiaFilter} onValueChange={setMateriaFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por materia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las materias</SelectItem>
          {materias.map((materia) => (
            <SelectItem key={materia.id} value={materia.id}>
              {materia.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={tipoFilter} onValueChange={setTipoFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="Parcial">Parcial</SelectItem>
          <SelectItem value="Trimestral">Trimestral</SelectItem>
          <SelectItem value="Oral">Oral</SelectItem>
          <SelectItem value="Trabajo Práctico">Trabajo Práctico</SelectItem>
          <SelectItem value="Taller">Taller</SelectItem>
          <SelectItem value="EF">Educación Física</SelectItem>
          <SelectItem value="Nota Final">Nota Final</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
