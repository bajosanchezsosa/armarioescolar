import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Link, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  User,
  BookOpen,
  Trash2
} from 'lucide-react';
import { useCursos } from '@/hooks/useCursos';
import { useActualizarEstadoMateria } from '@/hooks/useMateriasPendientes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface MateriasPendientesListProps {
  materiasPendientes: any[];
  materias: any[];
  alumnos: any[];
  onVincular: (materiaPendiente: any) => void;
  onEliminar: (materiaPendienteId: string) => void;
  showVinculadas?: boolean;
  isDeleting?: boolean;
  onAprobar?: (materiaPendienteId: string, nota: number) => void;
}

export const MateriasPendientesList = ({
  materiasPendientes,
  materias,
  alumnos,
  onVincular,
  onEliminar,
  showVinculadas = false,
  isDeleting = false,
  onAprobar
}: MateriasPendientesListProps) => {
  const [showAprobarDialog, setShowAprobarDialog] = React.useState(false);
  const [selectedMateria, setSelectedMateria] = React.useState<any>(null);
  const [notaFinal, setNotaFinal] = React.useState('');
  const { data: cursos } = useCursos();
  const actualizarEstado = useActualizarEstadoMateria();
  
  const getAlumnoName = (alumnoId: string) => {
    const alumno = alumnos.find(a => a.id === alumnoId);
    return alumno ? `${alumno.apellido}, ${alumno.nombre}` : 'Alumno no encontrado';
  };

  const getMateriaName = (materiaId: string) => {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? materia.nombre : 'Materia no encontrada';
  };

  const getCursoName = (cursoId: string) => {
    const curso = cursos?.find(c => c.id === cursoId);
    return curso ? `${curso.anio}° ${curso.division} - ${curso.turno}` : cursoId;
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pendiente</Badge>;
      case 'en_curso':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En Curso</Badge>;
      case 'aprobada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobada</Badge>;
      default:
        return <Badge variant="secondary">Sin Estado</Badge>;
    }
  };

  const handleAprobarClick = (materia: any) => {
    setSelectedMateria(materia);
    setShowAprobarDialog(true);
  };

  const handleConfirmarAprobacion = () => {
    if (selectedMateria && notaFinal) {
      actualizarEstado.mutate(
        {
          materiaPendienteId: selectedMateria.id,
          estado: 'aprobada',
          notaFinal: parseFloat(notaFinal),
        },
        {
          onSuccess: () => {
            setShowAprobarDialog(false);
            setNotaFinal('');
            setSelectedMateria(null);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {materiasPendientes.map((materiaPendiente) => (
        <Card key={materiaPendiente.id} className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Alumno */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {getAlumnoName(materiaPendiente.alumno_id)}
                  </span>
                </div>

                {/* Materia Original */}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    <strong>Materia Original:</strong> {materiaPendiente.materia_original?.nombre || 'Materia no encontrada'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {materiaPendiente.anio_origen}
                  </Badge>
                </div>

                {/* Materia Vinculada (si existe) */}
                {materiaPendiente.vinculada_con_materia_id && (
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">
                      <strong>Vinculada con:</strong> {materiaPendiente.materia_vinculada?.nombre || getMateriaName(materiaPendiente.vinculada_con_materia_id)}
                    </span>
                  </div>
                )}

                {/* Tipo de vinculación */}
                {materiaPendiente.tipo_vinculacion && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                      {materiaPendiente.tipo_vinculacion === 'intensificacion' ? 'Intensificación' : 'Recursa'}
                    </Badge>
                  </div>
                )}

                {/* Curso destino */}
                {materiaPendiente.curso_destino_id && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">
                      <strong>Curso destino:</strong> {getCursoName(materiaPendiente.curso_destino_id)}
                    </span>
                  </div>
                )}

                {/* Estado */}
                <div className="flex items-center gap-2">
                  {showVinculadas ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  {getEstadoBadge(materiaPendiente.estado || 'pendiente')}
                </div>

                {/* Observaciones */}
                {materiaPendiente.observaciones && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    <strong>Observaciones:</strong> {materiaPendiente.observaciones}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 ml-4">
                {!showVinculadas && !materiaPendiente.vinculada_con_materia_id && (
                  <Button
                    size="sm"
                    onClick={() => onVincular(materiaPendiente)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Vincular
                  </Button>
                )}
                
                {showVinculadas && materiaPendiente.vinculada_con_materia_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVincular(materiaPendiente)}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Cambiar Vinculación
                  </Button>
                )}

                {materiaPendiente.estado !== 'aprobada' && (
                  <Button
                    size="sm"
                    onClick={() => handleAprobarClick(materiaPendiente)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Aprobar
                  </Button>
                )}

                {/* Botón de eliminar */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onEliminar(materiaPendiente.id)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Dialog open={showAprobarDialog} onOpenChange={setShowAprobarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Materia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Estás por aprobar la materia <strong>{selectedMateria?.materia_original?.nombre}</strong> para el alumno <strong>{getAlumnoName(selectedMateria?.alumno_id)}</strong>.</p>
            <div>
              <Label htmlFor="notaFinal">Nota Final</Label>
              <Input
                id="notaFinal"
                type="number"
                value={notaFinal}
                onChange={(e) => setNotaFinal(e.target.value)}
              />
            </div>
            <Button onClick={handleConfirmarAprobacion} disabled={actualizarEstado.isPending}>
              {actualizarEstado.isPending ? 'Guardando...' : 'Confirmar Aprobación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 