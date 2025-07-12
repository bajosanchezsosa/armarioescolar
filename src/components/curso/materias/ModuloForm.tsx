
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MateriaModulo, GrupoTaller } from '@/types/database';

const moduloSchema = z.object({
  dia_semana: z.coerce.number().min(1).max(7),
  hora_inicio: z.string().min(1, 'La hora de inicio es requerida'),
  cantidad_modulos: z.coerce.number().min(1).max(6),
  grupo: z.enum(['A', 'B', 'todos'] as const),
});

type ModuloFormData = z.infer<typeof moduloSchema>;

interface ModuloFormProps {
  modulo?: MateriaModulo;
  materiaId: string;
  onSubmit: (data: ModuloFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showGrupo?: boolean;
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

export const ModuloForm = ({ 
  modulo, 
  materiaId, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showGrupo = true 
}: ModuloFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ModuloFormData>({
    resolver: zodResolver(moduloSchema),
    defaultValues: {
      dia_semana: modulo?.dia_semana || 1,
      hora_inicio: modulo?.hora_inicio || '',
      cantidad_modulos: modulo?.cantidad_modulos || 1,
      grupo: modulo?.grupo as GrupoTaller || 'todos',
    },
  });

  const diaValue = watch('dia_semana');
  const grupoValue = watch('grupo');

  const handleDiaChange = (value: string) => {
    setValue('dia_semana', parseInt(value));
  };

  const handleGrupoChange = (value: GrupoTaller) => {
    setValue('grupo', value);
  };

  const handleFormSubmit = (data: ModuloFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {modulo ? 'Editar Módulo' : 'Nuevo Módulo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dia_semana">Día de la Semana *</Label>
              <Select value={diaValue.toString()} onValueChange={handleDiaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el día" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((dia) => (
                    <SelectItem key={dia.value} value={dia.value.toString()}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dia_semana && (
                <p className="text-sm text-red-600">{errors.dia_semana.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de Inicio *</Label>
              <Input
                id="hora_inicio"
                type="time"
                {...register('hora_inicio')}
              />
              {errors.hora_inicio && (
                <p className="text-sm text-red-600">{errors.hora_inicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad_modulos">Cantidad de Módulos *</Label>
              <Input
                id="cantidad_modulos"
                type="number"
                min="1"
                max="6"
                {...register('cantidad_modulos')}
                placeholder="1-6"
              />
              {errors.cantidad_modulos && (
                <p className="text-sm text-red-600">{errors.cantidad_modulos.message}</p>
              )}
            </div>

            {showGrupo && (
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo *</Label>
                <Select value={grupoValue} onValueChange={handleGrupoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grupo A</SelectItem>
                    <SelectItem value="B">Grupo B</SelectItem>
                    <SelectItem value="todos">Todo el curso</SelectItem>
                  </SelectContent>
                </Select>
                {errors.grupo && (
                  <p className="text-sm text-red-600">{errors.grupo.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Información:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Cada módulo representa una clase de 60 minutos</li>
              <li>• Puedes agregar varios módulos para clases dobles o triples</li>
              <li>• Los grupos A y B se usan para talleres divididos</li>
              <li>• "Todo el curso" se usa para Clases y Educación Física</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : modulo ? 'Actualizar' : 'Agregar Módulo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
