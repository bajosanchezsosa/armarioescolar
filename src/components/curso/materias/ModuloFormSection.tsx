
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, Control, FieldArrayWithId, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { TipoMateria } from '@/types/database';

interface ModuloFormSectionProps {
  fields: FieldArrayWithId<any, "modulos", "id">[];
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  append: (value: any) => void;
  remove: (index: number) => void;
  tipoValue: TipoMateria;
  errors: FieldErrors<any>;
}

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export const ModuloFormSection = ({
  fields,
  register,
  setValue,
  watch,
  append,
  remove,
  tipoValue,
  errors
}: ModuloFormSectionProps) => {
  const getTipoInfo = (tipo: TipoMateria) => {
    switch (tipo) {
      case 'Clase':
        return { grupos: ['todos'] as const };
      case 'Taller':
        return { grupos: ['A', 'B'] as const };
      case 'EF':
        return { grupos: ['todos'] as const };
      default:
        return { grupos: ['todos'] as const };
    }
  };

  const tipoInfo = getTipoInfo(tipoValue);

  const handleDiaChange = (index: number, dia: string) => {
    setValue(`modulos.${index}.dia_semana`, parseInt(dia));
  };

  const handleGrupoChange = (index: number, grupo: 'A' | 'B' | 'todos') => {
    setValue(`modulos.${index}.grupo`, grupo);
  };

  const agregarModulo = () => {
    const grupoDefault = tipoValue === 'Taller' ? 'A' : 'todos';
    append({ dia_semana: 1, hora_inicio: '08:00', cantidad_modulos: 2, grupo: grupoDefault });
  };

  const eliminarModulo = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Módulos Horarios
          </h4>
          <p className="text-sm text-gray-600">
            Configura los días y horarios de la materia
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={agregarModulo}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Módulo
        </Button>
      </div>

      {errors.modulos && (
        <p className="text-sm text-red-600">{String(errors.modulos.message)}</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label>Día de la semana</Label>
                <Select
                  value={watch(`modulos.${index}.dia_semana`)?.toString()}
                  onValueChange={(value) => handleDiaChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modulos?.[index]?.dia_semana && (
                  <p className="text-sm text-red-600">
                    {String(errors.modulos[index]?.dia_semana?.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Hora de inicio</Label>
                <Input
                  type="time"
                  {...register(`modulos.${index}.hora_inicio`)}
                />
                {errors.modulos?.[index]?.hora_inicio && (
                  <p className="text-sm text-red-600">
                    {String(errors.modulos[index]?.hora_inicio?.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cantidad de módulos</Label>
                <Select
                  value={watch(`modulos.${index}.cantidad_modulos`)?.toString()}
                  onValueChange={(value) => setValue(`modulos.${index}.cantidad_modulos`, parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} módulo{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modulos?.[index]?.cantidad_modulos && (
                  <p className="text-sm text-red-600">
                    {String(errors.modulos[index]?.cantidad_modulos?.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select
                  value={watch(`modulos.${index}.grupo`)}
                  onValueChange={(value) => handleGrupoChange(index, value as 'A' | 'B' | 'todos')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoInfo.grupos.map((grupo) => (
                      <SelectItem key={grupo} value={grupo}>
                        {grupo === 'todos' ? 'Todo el curso' : `Grupo ${grupo}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modulos?.[index]?.grupo && (
                  <p className="text-sm text-red-600">
                    {String(errors.modulos[index]?.grupo?.message)}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => eliminarModulo(index)}
                  disabled={fields.length === 1}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {DIAS_SEMANA.find(d => d.value === watch(`modulos.${index}.dia_semana`))?.label} - {watch(`modulos.${index}.hora_inicio`)} 
              </span>
              <Badge variant="outline" className="text-xs">
                {watch(`modulos.${index}.cantidad_modulos`)} módulo{watch(`modulos.${index}.cantidad_modulos`) !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {watch(`modulos.${index}.grupo`) === 'todos' ? 'Todo el curso' : `Grupo ${watch(`modulos.${index}.grupo`)}`}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
