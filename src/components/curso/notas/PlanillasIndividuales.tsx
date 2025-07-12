
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Share2, Eye, Copy, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePlanillasCompartibles, useCreatePlanillaCompartible, useDeletePlanillaCompartible, generateUniqueToken, PlanillaCompartible } from '@/hooks/usePlanillasCompartibles';
import { PeriodoNota } from '@/hooks/usePeriodosNotas';
import { Materia } from '@/types/database';
import { PlanillaView } from './PlanillaView';
import { MobilePlanillasCard } from './MobilePlanillasCard';

interface PlanillasIndividualesProps {
  cursoId: string;
  periodoId: string;
  periodo: PeriodoNota;
  materias: Materia[];
}

export const PlanillasIndividuales = ({ cursoId, periodoId, periodo, materias }: PlanillasIndividualesProps) => {
  const isMobile = useIsMobile();
  const [selectedMateria, setSelectedMateria] = useState<string>('');
  const [viewingPlanilla, setViewingPlanilla] = useState<PlanillaCompartible | null>(null);
  
  const { data: planillas = [], isLoading } = usePlanillasCompartibles(cursoId, periodoId);
  const createPlanilla = useCreatePlanillaCompartible();
  const deletePlanilla = useDeletePlanillaCompartible();

  const handleCreatePlanilla = async () => {
    if (!selectedMateria) {
      toast.error('Selecciona una materia');
      return;
    }

    const existingPlanilla = planillas.find(p => p.materia_id === selectedMateria);
    if (existingPlanilla) {
      toast.error('Ya existe una planilla para esta materia');
      return;
    }

    const token = generateUniqueToken();
    
    await createPlanilla.mutateAsync({
      curso_id: cursoId,
      periodo_id: periodoId,
      materia_id: selectedMateria,
      token_url: token,
    });

    setSelectedMateria('');
  };

  const handleCopyLink = (planilla: PlanillaCompartible) => {
    const url = `${window.location.origin}/planilla/${planilla.token_url}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado al portapapeles');
  };

  const handleShareWhatsApp = (planilla: PlanillaCompartible) => {
    const url = `${window.location.origin}/planilla/${planilla.token_url}`;
    const message = `Hola! Te comparto la planilla de notas de ${planilla.materia?.nombre} - ${planilla.periodo?.nombre}. Podés completarla desde este link: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeletePlanilla = async (planilla: PlanillaCompartible) => {
    const confirmMessage = planilla.estado === 'completada' || planilla.estado === 'enviada_final'
      ? `¿Estás seguro de que deseas eliminar la planilla de ${planilla.materia?.nombre}? Esta planilla ya está completada y se perderán todos los datos.`
      : `¿Estás seguro de que deseas eliminar la planilla de ${planilla.materia?.nombre}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await deletePlanilla.mutateAsync(planilla.id);
      } catch (error) {
        console.error('Error deleting planilla:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Planilla - {periodo.nombre}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row items-end'}`}>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Materia</label>
              <Select value={selectedMateria} onValueChange={setSelectedMateria}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {materias
                    .filter(materia => !planillas.some(p => p.materia_id === materia.id))
                    .map((materia) => (
                      <SelectItem key={materia.id} value={materia.id}>
                        {materia.nombre} ({materia.tipo})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleCreatePlanilla}
              disabled={!selectedMateria || createPlanilla.isPending}
              className={`${isMobile ? 'w-full' : ''} bg-orange-600 hover:bg-orange-700`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Planilla
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planillas del Período</CardTitle>
        </CardHeader>
        <CardContent>
          {planillas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay planillas creadas para este período</p>
              <p className="text-sm">Crea una planilla para empezar</p>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {planillas.map((planilla) => (
                <MobilePlanillasCard
                  key={planilla.id}
                  planilla={planilla}
                  onView={setViewingPlanilla}
                  onDelete={handleDeletePlanilla}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Materia</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Profesor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {planillas.map((planilla) => (
                    <tr key={planilla.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{planilla.materia?.nombre}</p>
                          <p className="text-sm text-gray-500">{planilla.materia?.tipo}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          planilla.estado === 'enviada_final'
                            ? 'bg-blue-100 text-blue-800'
                            : planilla.estado === 'completada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {planilla.estado === 'enviada_final' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Enviada Final</>
                          ) : planilla.estado === 'completada' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Completada</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" />Pendiente</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {planilla.profesor_nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {planilla.estado === 'completada' && planilla.fecha_completada
                          ? format(new Date(planilla.fecha_completada), 'dd/MM/yyyy', { locale: es })
                          : format(new Date(planilla.created_at), 'dd/MM/yyyy', { locale: es })
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(planilla.estado === 'completada' || planilla.estado === 'enviada_final') ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewingPlanilla(planilla)}
                                title="Ver planilla"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePlanilla(planilla)}
                                title="Eliminar planilla"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletePlanilla.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShareWhatsApp(planilla)}
                                title="Compartir por WhatsApp"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyLink(planilla)}
                                title="Copiar link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePlanilla(planilla)}
                                title="Eliminar planilla"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletePlanilla.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {viewingPlanilla && (
        <PlanillaView
          planilla={viewingPlanilla}
          onClose={() => setViewingPlanilla(null)}
        />
      )}
    </div>
  );
};
