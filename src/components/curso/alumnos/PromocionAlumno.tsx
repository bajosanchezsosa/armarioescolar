
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Alumno, Curso } from '@/types/database';
import { useCursos } from '@/hooks/useCursos';
import { usePromociones } from '@/hooks/usePromociones';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useCrearMateriaPendiente } from '@/hooks/useMateriasPendientes';

interface PromocionAlumnoProps {
  alumno: Alumno;
  cursoActual: Curso;
  isOpen: boolean;
  onClose: () => void;
}

export const PromocionAlumno = ({ alumno, cursoActual, isOpen, onClose }: PromocionAlumnoProps) => {
  const [cursoDestinoId, setCursoDestinoId] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [materiasSeleccion, setMateriasSeleccion] = useState<any[]>([]);
  const { data: cursos } = useCursos();
  const { data: materiasCursoActual } = useMaterias(cursoActual.id);
  const { promoverAlumno } = usePromociones();
  const crearMateriaPendiente = useCrearMateriaPendiente();
  const { data: materiasCursoDestino } = useMaterias(cursoDestinoId);

  // Inicializar selección de materias al abrir el diálogo
  React.useEffect(() => {
    if (materiasCursoActual && materiasSeleccion.length === 0) {
      setMateriasSeleccion(materiasCursoActual.map((m: any) => ({
        materia: m,
        accion: 'promueve', // opciones: promueve, intensifica, recursa
        materiaDestinoId: '',
        contenidosPendientes: '',
      })));
    }
  }, [materiasCursoActual, isOpen]);

  // Filtrar cursos disponibles (excluir el actual)
  const cursosDisponibles = cursos?.filter(curso => 
    curso.id !== cursoActual.id && curso.activo
  ) || [];

  // Función para generar sugerencias de curso basadas en el año actual
  const getSugerenciaCurso = () => {
    const siguienteAnio = cursoActual.anio + 1;
    
    // Para 3er año, mostrar opciones de 4to con orientaciones
    if (cursoActual.anio === 3) {
      return cursosDisponibles.filter(curso => curso.anio === 4);
    }
    
    // Para otros años, buscar el mismo división en el siguiente año
    return cursosDisponibles.filter(curso => 
      curso.anio === siguienteAnio && 
      curso.division === cursoActual.division &&
      curso.turno === cursoActual.turno
    );
  };

  const cursosSugeridos = getSugerenciaCurso();
  const otrosCursos = cursosDisponibles.filter(curso => 
    !cursosSugeridos.some(sugerido => sugerido.id === curso.id)
  );

  const handleMateriaChange = (idx: number, field: string, value: any) => {
    setMateriasSeleccion(prev => prev.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  const handlePromocion = async () => {
    if (!cursoDestinoId) return;
    // Promover alumno
    await promoverAlumno.mutateAsync({
      alumno_id: alumno.id,
      curso_destino_id: cursoDestinoId,
      observaciones: observaciones.trim() || undefined,
    });
    // Registrar materias pendientes
    for (const item of materiasSeleccion) {
      if (item.accion === 'intensifica' || item.accion === 'recursa') {
        await crearMateriaPendiente.mutateAsync({
          alumnoId: alumno.id,
          materiaOriginalId: item.materia.id,
          anioOrigen: cursoActual.anio,
          observaciones: item.contenidosPendientes,
          materiaDestinoId: item.materiaDestinoId,
          tipo: item.accion,
          cursoDestinoId: cursoDestinoId,
        });
      }
    }
    setCursoDestinoId('');
    setObservaciones('');
    setMateriasSeleccion([]);
    onClose();
  };

  const formatCurso = (curso: Curso) => 
    `${curso.anio}° ${curso.division} - ${curso.turno}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Promover Alumno
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del alumno */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {alumno.nombre} {alumno.apellido}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Curso actual:</span>
              <Badge variant="outline">{formatCurso(cursoActual)}</Badge>
            </div>
          </div>

          {/* Selección de curso destino */}
          <div className="space-y-2">
            <Label htmlFor="curso-destino">Curso de destino *</Label>
            <Select value={cursoDestinoId} onValueChange={setCursoDestinoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso de destino" />
              </SelectTrigger>
              <SelectContent>
                {cursosSugeridos.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                      Sugeridos
                    </div>
                    {cursosSugeridos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{formatCurso(curso)}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Recomendado
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {otrosCursos.length > 0 && (
                  <>
                    {cursosSugeridos.length > 0 && (
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                        Otros cursos
                      </div>
                    )}
                    {otrosCursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {formatCurso(curso)}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de materias y acción */}
          {materiasSeleccion.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Materias del curso actual</h4>
              {materiasSeleccion.map((item, idx) => (
                <div key={item.materia.id} className="border rounded p-2 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{item.materia.nombre}</span>
                    <Select value={item.accion} onValueChange={v => handleMateriaChange(idx, 'accion', v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promueve">Promueve</SelectItem>
                        <SelectItem value="intensifica">Intensifica</SelectItem>
                        <SelectItem value="recursa">Recursa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(item.accion === 'intensifica' || item.accion === 'recursa') && (
                    <>
                      <div className="mb-2">
                        <Label>Materia destino</Label>
                        <Select value={item.materiaDestinoId} onValueChange={v => handleMateriaChange(idx, 'materiaDestinoId', v)}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Seleccionar materia destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {(materiasCursoDestino || []).map((m: any) => (
                              <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Contenidos pendientes (opcional)</Label>
                        <Textarea
                          value={item.contenidosPendientes}
                          onChange={e => handleMateriaChange(idx, 'contenidosPendientes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Preview de la promoción */}
          {cursoDestinoId && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-sm">
                <Badge variant="outline">{formatCurso(cursoActual)}</Badge>
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <Badge className="bg-blue-600">
                  {formatCurso(cursosDisponibles.find(c => c.id === cursoDestinoId)!)}
                </Badge>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Agregar comentarios sobre la promoción..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePromocion}
              disabled={!cursoDestinoId || promoverAlumno.isPending}
            >
              {promoverAlumno.isPending ? 'Promoviendo...' : 'Promover Alumno'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
