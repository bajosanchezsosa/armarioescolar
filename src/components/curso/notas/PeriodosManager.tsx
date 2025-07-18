
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { usePeriodosNotas, useCreatePeriodoNota, PeriodoNota } from '@/hooks/usePeriodosNotas';

interface PeriodosManagerProps {
  cursoId: string;
  onPeriodoSelect: (periodo: PeriodoNota) => void;
  selectedPeriodo?: PeriodoNota;
}

export const PeriodosManager = ({ cursoId, onPeriodoSelect, selectedPeriodo }: PeriodosManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
  const [fechaFin, setFechaFin] = useState<Date | undefined>();

  const { data: periodos = [], isLoading } = usePeriodosNotas(cursoId);
  const createPeriodo = useCreatePeriodoNota();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) return;

    createPeriodo.mutate({
      curso_id: cursoId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      fecha_inicio: fechaInicio ? format(fechaInicio, 'yyyy-MM-dd') : undefined,
      fecha_fin: fechaFin ? format(fechaFin, 'yyyy-MM-dd') : undefined,
      activo: true
    }, {
      onSuccess: () => {
        setShowForm(false);
        setNombre('');
        setDescripcion('');
        setFechaInicio(undefined);
        setFechaFin(undefined);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Períodos de Notas
          </CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Período
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Período</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Período *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej: Notas Finales Diciembre"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción opcional del período"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fechaInicio && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaInicio ? (
                            format(fechaInicio, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fechaInicio}
                          onSelect={setFechaInicio}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha Fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fechaFin && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaFin ? (
                            format(fechaFin, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fechaFin}
                          onSelect={setFechaFin}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createPeriodo.isPending}>
                    {createPeriodo.isPending ? 'Creando...' : 'Crear Período'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {periodos.map((periodo) => (
            <Button
              key={periodo.id}
              variant={selectedPeriodo?.id === periodo.id ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-start"
              onClick={() => onPeriodoSelect(periodo)}
            >
              <span className="font-medium">{periodo.nombre}</span>
              {periodo.descripcion && (
                <span className="text-xs text-muted-foreground mt-1">
                  {periodo.descripcion}
                </span>
              )}
              {(periodo.fecha_inicio || periodo.fecha_fin) && periodo.nombre !== 'Nota Final' && (
                <span className="text-xs text-muted-foreground mt-1">
                  {periodo.fecha_inicio && format(new Date(periodo.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                  {periodo.fecha_inicio && periodo.fecha_fin && ' - '}
                  {periodo.fecha_fin && format(new Date(periodo.fecha_fin), 'dd/MM/yyyy', { locale: es })}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
