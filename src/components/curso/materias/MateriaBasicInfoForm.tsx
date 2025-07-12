
import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TipoMateria } from '@/types/database';

interface MateriaBasicInfoFormProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  tipoValue: TipoMateria;
  onTipoChange: (value: TipoMateria) => void;
  errors: FieldErrors<any>;
  profesorValue?: string;
}

export const MateriaBasicInfoForm = ({
  register,
  setValue,
  tipoValue,
  onTipoChange,
  errors,
  profesorValue
}: MateriaBasicInfoFormProps) => {
  const getTipoInfo = (tipo: TipoMateria) => {
    switch (tipo) {
      case 'Clase':
        return { 
          description: 'Materias teóricas para todo el curso junto', 
          grupos: ['todos'] as const
        };
      case 'Taller':
        return { 
          description: 'Materias prácticas divididas en grupos A y B', 
          grupos: ['A', 'B'] as const
        };
      case 'EF':
        return { 
          description: 'Educación Física para todo el curso junto', 
          grupos: ['todos'] as const
        };
      default:
        return { description: '', grupos: ['todos'] as const };
    }
  };

  const tipoInfo = getTipoInfo(tipoValue);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de la Materia *</Label>
          <Input
            id="nombre"
            {...register('nombre')}
            placeholder="Ej: Matemática, Programación..."
          />
          {errors.nombre && (
            <p className="text-sm text-red-600">{String(errors.nombre.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Materia *</Label>
          <Select value={tipoValue} onValueChange={onTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Clase">Clase</SelectItem>
              <SelectItem value="Taller">Taller</SelectItem>
              <SelectItem value="EF">Educación Física</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-red-600">{String(errors.tipo.message)}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="profesor">Profesor (Opcional)</Label>
          <Input
            id="profesor"
            {...register('profesor')}
            placeholder="Nombre del profesor a cargo..."
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tipo seleccionado: {tipoValue}</h4>
        <p className="text-sm text-blue-800">{tipoInfo.description}</p>
      </div>
    </>
  );
};
