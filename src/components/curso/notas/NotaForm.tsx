
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NotaInput, useCreateNota, useUpdateNota, Nota } from '@/hooks/useNotas';
import { Alumno } from '@/types/database';

const notaSchema = z.object({
  alumno_id: z.string().min(1, 'Selecciona un alumno'),
  materia_id: z.string().min(1, 'Selecciona una materia'),
  tipo_evaluacion: z.enum(['Parcial', 'Trimestral', 'Oral', 'Trabajo Práctico', 'Taller', 'Educación Física']),
  nota: z.string().nullable(),
  fecha: z.string().min(1, 'Selecciona una fecha'),
  observaciones: z.string().optional(),
});

type NotaFormData = z.infer<typeof notaSchema>;

interface NotaFormProps {
  alumnos: Alumno[];
  materias: any[];
  cursoId: string;
  periodoId?: string;
  editingNota?: Nota | null;
  onCancel: () => void;
}

export const NotaForm = ({ alumnos, materias, cursoId, periodoId, editingNota, onCancel }: NotaFormProps) => {
  const createNota = useCreateNota();
  const updateNota = useUpdateNota();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotaFormData>({
    resolver: zodResolver(notaSchema),
    defaultValues: {
      alumno_id: editingNota?.alumno_id || '',
      materia_id: editingNota?.materia_id || '',
      tipo_evaluacion: (editingNota?.tipo_evaluacion as any) || 'Parcial',
      nota: editingNota?.nota || '',
      fecha: editingNota?.fecha || '',
      observaciones: editingNota?.observaciones || '',
    },
  });

  const alumnoValue = watch('alumno_id');
  const materiaValue = watch('materia_id');
  const tipoValue = watch('tipo_evaluacion');
  const fechaValue = watch('fecha');

  const handleAlumnoChange = (value: string) => {
    setValue('alumno_id', value);
  };

  const handleMateriaChange = (value: string) => {
    setValue('materia_id', value);
  };

  const handleTipoChange = (value: string) => {
    setValue('tipo_evaluacion', value as any);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('fecha', format(date, 'yyyy-MM-dd'));
    }
  };

  const onSubmit = (data: NotaFormData) => {
    console.log('Submitting nota:', data);
    
    if (!data.alumno_id || !data.materia_id || !data.tipo_evaluacion || !data.fecha) {
      console.error('Missing required fields');
      return;
    }
    
    const notaInput: NotaInput = {
      alumno_id: data.alumno_id,
      materia_id: data.materia_id,
      curso_id: cursoId,
      periodo_id: periodoId,
      tipo_evaluacion: data.tipo_evaluacion,
      nota: data.nota || null,
      fecha: data.fecha,
      observaciones: data.observaciones || '',
    };
    
    if (editingNota) {
      updateNota.mutate({ id: editingNota.id, ...notaInput }, {
        onSuccess: () => {
          onCancel();
        },
      });
    } else {
      createNota.mutate(notaInput, {
        onSuccess: () => {
          onCancel();
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{editingNota ? 'Editar Nota' : 'Nueva Nota'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="alumno_id">Alumno *</Label>
              <Select value={alumnoValue || ''} onValueChange={handleAlumnoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un alumno" />
                </SelectTrigger>
                <SelectContent>
                  {alumnos.filter(a => a.activo).map((alumno) => (
                    <SelectItem key={alumno.id} value={alumno.id}>
                      {alumno.apellido}, {alumno.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.alumno_id && (
                <p className="text-sm text-red-600">{errors.alumno_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="materia_id">Materia *</Label>
              <Select value={materiaValue || ''} onValueChange={handleMateriaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((materia) => (
                    <SelectItem key={materia.id} value={materia.id}>
                      {materia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.materia_id && (
                <p className="text-sm text-red-600">{errors.materia_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_evaluacion">Tipo de Evaluación *</Label>
              <Select value={tipoValue || ''} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="Trabajo Práctico">Trabajo Práctico</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Educación Física">Educación Física</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_evaluacion && (
                <p className="text-sm text-red-600">{errors.tipo_evaluacion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nota">Nota</Label>
              <Input
                id="nota"
                {...register('nota')}
                placeholder="Ej: 8, 7.5, A, B, NC (No Califica)"
              />
              <p className="text-xs text-gray-500">
                Acepta números (1-10) o letras (A, B, C, etc.)
              </p>
              {errors.nota && (
                <p className="text-sm text-red-600">{errors.nota.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaValue && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaValue ? (
                      format(new Date(fechaValue), "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaValue ? new Date(fechaValue) : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {errors.fecha && (
                <p className="text-sm text-red-600">{errors.fecha.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              {...register('observaciones')}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Información:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Las notas pueden ser numéricas (1-10) o letras (A, B, C, etc.)</li>
              <li>• Puedes dejar la nota vacía si el alumno no califica</li>
              <li>• Las observaciones son opcionales pero recomendadas</li>
              {periodoId && <li>• Esta nota se registrará en el período seleccionado</li>}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createNota.isPending || updateNota.isPending}>
              {createNota.isPending || updateNota.isPending 
                ? 'Guardando...' 
                : editingNota ? 'Actualizar Nota' : 'Guardar Nota'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
