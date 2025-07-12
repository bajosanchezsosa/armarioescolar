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
import { CalendarIcon, X, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NotaInput, useCreateNota, useUpdateNota, Nota } from '@/hooks/useNotas';
import { Alumno } from '@/types/database';
import { PeriodoNota } from '@/hooks/usePeriodosNotas';

const notaFinalSchema = z.object({
  alumno_id: z.string().min(1, 'Selecciona un alumno'),
  materia_id: z.string().min(1, 'Selecciona una materia'),
  nota: z.string().nullable(),
  fecha: z.string().min(1, 'Selecciona una fecha'),
  observaciones: z.string().optional(),
});

type NotaFinalFormData = z.infer<typeof notaFinalSchema>;

interface NotaFinalFormProps {
  alumnos: Alumno[];
  materias: any[];
  cursoId: string;
  periodoNotaFinal: PeriodoNota;
  editingNota?: Nota | null;
  onCancel: () => void;
}

export const NotaFinalForm = ({ 
  alumnos, 
  materias, 
  cursoId, 
  periodoNotaFinal, 
  editingNota, 
  onCancel 
}: NotaFinalFormProps) => {
  const createNota = useCreateNota();
  const updateNota = useUpdateNota();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotaFinalFormData>({
    resolver: zodResolver(notaFinalSchema),
    defaultValues: {
      alumno_id: editingNota?.alumno_id || '',
      materia_id: editingNota?.materia_id || '',
      nota: editingNota?.nota || '',
      fecha: editingNota?.fecha || '',
      observaciones: editingNota?.observaciones || '',
    },
  });

  const alumnoValue = watch('alumno_id');
  const materiaValue = watch('materia_id');
  const fechaValue = watch('fecha');

  const handleAlumnoChange = (value: string) => {
    setValue('alumno_id', value);
  };

  const handleMateriaChange = (value: string) => {
    setValue('materia_id', value);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('fecha', format(date, 'yyyy-MM-dd'));
    }
  };

  const onSubmit = (data: NotaFinalFormData) => {
    console.log('Submitting nota final:', data);
    
    if (!data.alumno_id || !data.materia_id || !data.fecha) {
      console.error('Missing required fields');
      return;
    }
    
    const notaInput: NotaInput = {
      alumno_id: data.alumno_id,
      materia_id: data.materia_id,
      curso_id: cursoId,
      periodo_id: periodoNotaFinal.id,
      tipo_evaluacion: 'Nota Final',
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
    <Card className="border-2 border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <GraduationCap className="h-5 w-5" />
            {editingNota ? 'Editar Nota Final' : 'Nueva Nota Final'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Período: <strong>{periodoNotaFinal.nombre}</strong>
          {periodoNotaFinal.descripcion && ` - ${periodoNotaFinal.descripcion}`}
        </p>
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
              <Label htmlFor="nota">Nota Final</Label>
              <Input
                id="nota"
                {...register('nota')}
                placeholder="Ej: 8, 7.5, A, B, NC (No Califica)"
              />
              <p className="text-xs text-gray-500">
                Nota definitiva del alumno en esta materia
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
              placeholder="Observaciones sobre la nota final (opcional)"
              rows={3}
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">Nota Final - Información Importante:</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Esta es la <strong>nota definitiva</strong> del alumno en la materia</li>
              <li>• Se registrará en el período "{periodoNotaFinal.nombre}"</li>
              <li>• Las notas pueden ser numéricas (1-10) o letras (A, B, C, etc.)</li>
              <li>• Puedes dejar la nota vacía si el alumno no califica</li>
              <li>• Esta nota se usará para las calificaciones finales oficiales</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createNota.isPending || updateNota.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {createNota.isPending || updateNota.isPending 
                ? 'Guardando...' 
                : editingNota ? 'Actualizar Nota Final' : 'Guardar Nota Final'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 