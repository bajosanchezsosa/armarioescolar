import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileDown, Loader2 } from 'lucide-react';
import { PlanillaCompartible, useUpdatePlanillaCompartible } from '@/hooks/usePlanillasCompartibles';
import { useNotas } from '@/hooks/useNotas';
import { useAlumnos } from '@/hooks/useAlumnos';
import { useBulkCreateCalificacionesFinales, CalificacionFinalInput } from '@/hooks/useCalificacionesFinales';

interface EnviarCalificacionesFinalesButtonProps {
  planilla: PlanillaCompartible;
  onComplete?: () => void;
}

export const EnviarCalificacionesFinalesButton = ({ 
  planilla, 
  onComplete 
}: EnviarCalificacionesFinalesButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notas = [] } = useNotas(
    planilla.curso_id,
    planilla.materia_id,
    planilla.periodo_id
  );
  
  const { data: alumnos = [] } = useAlumnos(planilla.curso_id);
  const bulkCreateCalificaciones = useBulkCreateCalificacionesFinales();
  const updatePlanilla = useUpdatePlanillaCompartible();

  const calcularNotaFinal = (alumnoId: string) => {
    const notasAlumno = notas.filter(n => n.alumno_id === alumnoId);
    if (notasAlumno.length === 0) return null;
    
    // Si hay múltiples notas, calculamos el promedio
    const notasNumericas = notasAlumno
      .map(n => parseFloat(n.nota || '0'))
      .filter(n => !isNaN(n) && n > 0);
    
    if (notasNumericas.length === 0) return null;
    
    const promedio = notasNumericas.reduce((sum, nota) => sum + nota, 0) / notasNumericas.length;
    return Math.round(promedio * 100) / 100; // Redondear a 2 decimales
  };

  const determinarEstado = (notaFinal: number | null): 'aprobada' | 'pendiente' => {
    if (!notaFinal || notaFinal < 6) return 'pendiente';
    return 'aprobada';
  };

  const getAnioLectivo = () => {
    // Inferir el año lectivo desde la fecha actual o el período
    return new Date().getFullYear();
  };

  const handleEnviarCalificaciones = async () => {
    try {
      const alumnosActivos = alumnos.filter(a => a.activo);
      const anioLectivo = getAnioLectivo();
      
      const calificacionesParaEnviar: CalificacionFinalInput[] = alumnosActivos.map(alumno => {
        const notaFinal = calcularNotaFinal(alumno.id);
        const estado = determinarEstado(notaFinal);
        
        return {
          alumno_id: alumno.id,
          materia_id: planilla.materia_id,
          curso_id: planilla.curso_id,
          anio_lectivo: anioLectivo,
          calificacion_definitiva: notaFinal?.toString() || null,
          estado,
          observaciones: `Calificación generada desde planilla ${planilla.periodo?.nombre} - ${planilla.materia?.nombre}`
        };
      });

      // Enviar calificaciones a la tabla final
      await bulkCreateCalificaciones.mutateAsync(calificacionesParaEnviar);
      
      // Actualizar estado de la planilla
      await updatePlanilla.mutateAsync({
        id: planilla.id,
        estado: 'enviada_final'
      });

      setIsOpen(false);
      onComplete?.();
    } catch (error) {
      console.error('Error enviando calificaciones finales:', error);
    }
  };

  const alumnosConNotas = alumnos.filter(a => a.activo && calcularNotaFinal(a.id) !== null);
  const alumnosSinNotas = alumnos.filter(a => a.activo && calcularNotaFinal(a.id) === null);

  // Solo mostrar el botón si la planilla está completada
  if (planilla.estado !== 'completada' && planilla.estado !== 'enviada_final') {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="default" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={planilla.estado === 'enviada_final'}
        >
          <FileDown className="h-4 w-4 mr-2" />
          {planilla.estado === 'enviada_final' ? 'Ya Enviada' : 'Enviar a Calificaciones Finales'}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Enviar a Calificaciones Finales</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Se van a enviar las calificaciones de <strong>{planilla.materia?.nombre}</strong> 
                del período <strong>{planilla.periodo?.nombre}</strong> a la tabla oficial de calificaciones finales.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800">Alumnos con notas:</p>
                  <p className="text-2xl font-bold text-green-600">{alumnosConNotas.length}</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Alumnos sin notas:</p>
                  <p className="text-2xl font-bold text-orange-600">{alumnosSinNotas.length}</p>
                </div>
              </div>

              {alumnosSinNotas.length > 0 && (
                <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                  <p className="text-sm text-orange-800">
                    <strong>Advertencia:</strong> Los alumnos sin notas quedarán marcados como "pendiente" 
                    en las calificaciones finales.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Esta acción calculará la nota final para cada alumno y la registrará en el sistema oficial.
                Si ya existen calificaciones para estos alumnos en esta materia, serán actualizadas.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleEnviarCalificaciones}
            disabled={bulkCreateCalificaciones.isPending || updatePlanilla.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {(bulkCreateCalificaciones.isPending || updatePlanilla.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Confirmar Envío
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};