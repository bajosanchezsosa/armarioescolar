
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, User, AlertTriangle, Heart, Shield, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCreateActa, useUpdateActa, CreateActaData } from '@/hooks/useActas';
import { useAlumnos } from '@/hooks/useAlumnos';
import { TipoActa, PrioridadActa, ActaConAlumnos } from '@/types/database';

interface ActaFormProps {
  cursoId: string;
  isOpen: boolean;
  onClose: () => void;
  acta?: ActaConAlumnos;
}

const tipoActaOptions: { value: TipoActa; label: string; icon: any; color: string }[] = [
  { value: 'curso', label: 'Todo el curso', icon: Users, color: 'bg-blue-500' },
  { value: 'alumno', label: 'Alumno específico', icon: User, color: 'bg-green-500' },
  { value: 'disciplinario', label: 'Disciplinario', icon: AlertTriangle, color: 'bg-orange-500' },
  { value: 'salud', label: 'Salud', icon: Heart, color: 'bg-red-500' },
  { value: 'accidente', label: 'Accidente', icon: Shield, color: 'bg-purple-500' },
  { value: 'otro', label: 'Otro', icon: FileText, color: 'bg-gray-500' },
];

const prioridadOptions: { value: PrioridadActa; label: string; color: string }[] = [
  { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-800' },
];

export const ActaForm = ({ cursoId, isOpen, onClose, acta }: ActaFormProps) => {
  const [selectedAlumnos, setSelectedAlumnos] = useState<string[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<TipoActa>('otro');
  
  const { data: alumnos = [] } = useAlumnos(cursoId);
  const createActa = useCreateActa();
  const updateActa = useUpdateActa();

  const form = useForm({
    defaultValues: {
      titulo: '',
      descripcion: '',
      tipo: 'otro' as TipoActa,
      prioridad: 'media' as PrioridadActa,
      fecha: new Date(),
    },
  });

  // Inicializar el formulario si hay un acta para editar
  useEffect(() => {
    if (acta) {
      form.reset({
        titulo: acta.titulo,
        descripcion: acta.descripcion,
        tipo: acta.tipo as TipoActa,
        prioridad: acta.prioridad as PrioridadActa,
        fecha: new Date(acta.fecha),
      });
      setSelectedTipo(acta.tipo as TipoActa);
      setSelectedAlumnos(acta.acta_alumnos?.map(aa => aa.alumno_id) || []);
    } else {
      form.reset({
        titulo: '',
        descripcion: '',
        tipo: 'otro',
        prioridad: 'media',
        fecha: new Date(),
      });
      setSelectedTipo('otro');
      setSelectedAlumnos([]);
    }
  }, [acta, form]);

  const onSubmit = async (data: any) => {
    const formData: CreateActaData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      prioridad: data.prioridad,
      fecha: format(data.fecha, 'yyyy-MM-dd'),
      curso_id: cursoId,
      alumno_ids: selectedTipo === 'curso' ? [] : selectedAlumnos,
    };

    try {
      if (acta) {
        await updateActa.mutateAsync({
          id: acta.id,
          updates: {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            tipo: formData.tipo,
            prioridad: formData.prioridad,
            fecha: formData.fecha,
          },
          alumno_ids: formData.alumno_ids,
        });
      } else {
        await createActa.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar acta:', error);
    }
  };

  const handleAlumnoToggle = (alumnoId: string) => {
    setSelectedAlumnos(prev => 
      prev.includes(alumnoId)
        ? prev.filter(id => id !== alumnoId)
        : [...prev, alumnoId]
    );
  };

  const selectedTipoOption = tipoActaOptions.find(option => option.value === selectedTipo);
  const IconComponent = selectedTipoOption?.icon || FileText;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {acta ? 'Editar Acta' : 'Nueva Acta'}
          </SheetTitle>
          <SheetDescription>
            {acta ? 'Modifica los datos del acta' : 'Registra un nuevo acontecimiento importante'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del acta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acta</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedTipo(value as TipoActa);
                        if (value === 'curso') {
                          setSelectedAlumnos([]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tipoActaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${option.color}`} />
                              <option.icon className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prioridadOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTipo !== 'curso' && (
              <div className="space-y-3">
                <FormLabel>Alumnos Involucrados</FormLabel>
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                  {alumnos.map((alumno) => (
                    <div key={alumno.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={alumno.id}
                        checked={selectedAlumnos.includes(alumno.id)}
                        onCheckedChange={() => handleAlumnoToggle(alumno.id)}
                      />
                      <label
                        htmlFor={alumno.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {alumno.apellido}, {alumno.nombre}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedAlumnos.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedAlumnos.length} alumno{selectedAlumnos.length > 1 ? 's' : ''} seleccionado{selectedAlumnos.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe detalladamente el acontecimiento..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createActa.isPending || updateActa.isPending}
                className="flex-1"
              >
                {acta ? 'Actualizar Acta' : 'Crear Acta'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
