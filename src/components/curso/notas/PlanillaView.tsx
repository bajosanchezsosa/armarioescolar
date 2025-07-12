
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, School, BookOpen, Users, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlanillaCompartible } from '@/hooks/usePlanillasCompartibles';
import { useAlumnos } from '@/hooks/useAlumnos';
import { useNotas } from '@/hooks/useNotas';
import { EnviarCalificacionesFinalesButton } from './EnviarCalificacionesFinalesButton';

interface PlanillaViewProps {
  planilla: PlanillaCompartible;
  onClose: () => void;
}

export const PlanillaView = ({ planilla, onClose }: PlanillaViewProps) => {
  const { data: alumnos = [], isLoading: alumnosLoading } = useAlumnos(planilla.curso_id);
  const { data: notas = [], isLoading: notasLoading } = useNotas(
    planilla.curso_id,
    planilla.materia_id,
    planilla.periodo_id
  );

  console.log('PlanillaView - Planilla:', planilla);
  console.log('PlanillaView - Alumnos:', alumnos);
  console.log('PlanillaView - Notas:', notas);

  const alumnosActivos = alumnos.filter(a => a.activo);
  
  // Crear mapa de notas por alumno
  const notasPorAlumno = notas.reduce((acc, nota) => {
    acc[nota.alumno_id] = nota;
    return acc;
  }, {} as Record<string, any>);

  const isCalificacionesFinalPeriod = planilla.periodo?.nombre?.toLowerCase().includes('calificación final') || 
                                     planilla.periodo?.nombre?.toLowerCase().includes('calificaciones finales');

  if (alumnosLoading || notasLoading) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando planilla...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Vista de Planilla - {planilla.materia?.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la planilla */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Información de la Planilla</CardTitle>
                <Badge className={
                  planilla.estado === 'enviada_final' 
                    ? 'bg-blue-100 text-blue-800'
                    : planilla.estado === 'completada' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }>
                  {planilla.estado === 'enviada_final' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enviada Final
                    </>
                  ) : planilla.estado === 'completada' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completada
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Pendiente
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Curso</p>
                    <p className="font-medium">
                      {planilla.curso?.anio}° {planilla.curso?.division}° - {planilla.curso?.turno}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Materia</p>
                    <p className="font-medium">{planilla.materia?.nombre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Período</p>
                    <p className="font-medium">{planilla.periodo?.nombre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Profesor</p>
                    <p className="font-medium">{planilla.profesor_nombre || 'No asignado'}</p>
                  </div>
                </div>
              </div>
              
              {planilla.fecha_completada && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Completada el {format(new Date(planilla.fecha_completada), 'dd/MM/yyyy \'a las\' HH:mm', { locale: es })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botón para enviar a calificaciones finales - solo para períodos especiales */}
          {(planilla.estado === 'completada' || planilla.estado === 'enviada_final') && isCalificacionesFinalPeriod && (
            <div className="flex justify-center">
              <EnviarCalificacionesFinalesButton 
                planilla={planilla}
                onComplete={onClose}
              />
            </div>
          )}

          {/* Notas de los alumnos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notas Registradas</span>
                <Badge variant="outline">
                  {alumnosActivos.length} alumnos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alumnosActivos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay alumnos activos en este curso</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">#</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Alumno</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nota</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tipo Evaluación</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {alumnosActivos.map((alumno, index) => {
                        const nota = notasPorAlumno[alumno.id];
                        
                        return (
                          <tr key={alumno.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {alumno.apellido}, {alumno.nombre}
                                </p>
                                {alumno.dni && (
                                  <p className="text-xs text-gray-500">
                                    DNI: {alumno.dni}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {nota?.nota ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {nota.nota}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Sin nota</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {nota?.tipo_evaluacion || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {nota?.observaciones || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
