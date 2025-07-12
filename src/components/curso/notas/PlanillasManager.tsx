
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Plus, Copy, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { usePlanillasCompartibles, useCreatePlanillaCompartible, generateUniqueToken, PlanillaCompartible } from '@/hooks/usePlanillasCompartibles';
import { PeriodoNota } from '@/hooks/usePeriodosNotas';

interface PlanillasManagerProps {
  cursoId: string;
  periodoId: string;
  periodo: PeriodoNota;
  materias: any[];
}

export const PlanillasManager = ({ cursoId, periodoId, periodo, materias }: PlanillasManagerProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);

  const { data: planillas = [], isLoading } = usePlanillasCompartibles(cursoId, periodoId);
  const createPlanilla = useCreatePlanillaCompartible();

  const handleCreatePlanillas = () => {
    if (selectedMaterias.length === 0) {
      toast.error('Selecciona al menos una materia');
      return;
    }

    const planillasToCreate = selectedMaterias.map(materiaId => ({
      periodo_id: periodoId,
      materia_id: materiaId,
      curso_id: cursoId,
      token_url: generateUniqueToken()
    }));

    // Creamos las planillas una por una
    Promise.all(
      planillasToCreate.map(planilla => 
        createPlanilla.mutateAsync(planilla)
      )
    ).then(() => {
      setShowCreateDialog(false);
      setSelectedMaterias([]);
      toast.success(`${planillasToCreate.length} planillas creadas exitosamente`);
    }).catch((error) => {
      console.error('Error creating planillas:', error);
      toast.error('Error al crear las planillas');
    });
  };

  const copyPlanillaLink = (planilla: PlanillaCompartible) => {
    const url = `${window.location.origin}/planilla/${planilla.token_url}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado al portapapeles');
  };

  const openPlanillaLink = (planilla: PlanillaCompartible) => {
    const url = `${window.location.origin}/planilla/${planilla.token_url}`;
    window.open(url, '_blank');
  };

  // Filtrar materias que ya tienen planilla en este período
  const materiasDisponibles = materias.filter(materia => 
    !planillas.some(planilla => planilla.materia_id === materia.id)
  );

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
            <Share2 className="h-5 w-5" />
            Planillas Compartibles - {periodo.nombre}
          </CardTitle>
          {materiasDisponibles.length > 0 && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Planillas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Planillas para {periodo.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Selecciona las materias para las cuales deseas crear planillas compartibles:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {materiasDisponibles.map((materia) => (
                      <div key={materia.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={materia.id}
                          checked={selectedMaterias.includes(materia.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaterias([...selectedMaterias, materia.id]);
                            } else {
                              setSelectedMaterias(selectedMaterias.filter(id => id !== materia.id));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={materia.id} className="text-sm">
                          {materia.nombre} ({materia.tipo})
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePlanillas} disabled={createPlanilla.isPending}>
                      {createPlanilla.isPending ? 'Creando...' : `Crear ${selectedMaterias.length} Planillas`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {planillas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay planillas creadas para este período</p>
            <p className="text-sm">Crear planillas para compartir con los profesores</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Planillas</p>
                <p className="text-2xl font-bold text-blue-900">{planillas.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Completadas</p>
                <p className="text-2xl font-bold text-green-900">
                  {planillas.filter(p => p.estado === 'completada').length}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-900">
                  {planillas.filter(p => p.estado === 'pendiente').length}
                </p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Fecha Completada</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planillas.map((planilla) => (
                    <TableRow key={planilla.id}>
                      <TableCell className="font-medium">
                        {planilla.materia?.nombre}
                        <br />
                        <span className="text-xs text-gray-500">
                          {planilla.materia?.tipo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={planilla.estado === 'completada' ? 'default' : 'secondary'}
                          className={planilla.estado === 'completada' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                        >
                          {planilla.estado === 'completada' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completada
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {planilla.profesor_nombre || '-'}
                      </TableCell>
                      <TableCell>
                        {planilla.fecha_completada 
                          ? format(new Date(planilla.fecha_completada), 'dd/MM/yyyy HH:mm', { locale: es })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPlanillaLink(planilla)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPlanillaLink(planilla)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
