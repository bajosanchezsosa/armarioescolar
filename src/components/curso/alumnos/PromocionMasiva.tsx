
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import { Alumno, Curso } from '@/types/database';
import { useCursos } from '@/hooks/useCursos';
import { usePromociones } from '@/hooks/usePromociones';

interface PromocionMasivaProps {
  alumnos: Alumno[];
  cursoActual: Curso;
  isOpen: boolean;
  onClose: () => void;
}

export const PromocionMasiva = ({ alumnos, cursoActual, isOpen, onClose }: PromocionMasivaProps) => {
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<string[]>([]);
  const [cursoDestinoId, setCursoDestinoId] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  
  const { data: cursos } = useCursos();
  const { promoverAlumnosEnLote } = usePromociones();

  // Filtrar cursos disponibles (excluir el actual)
  const cursosDisponibles = cursos?.filter(curso => 
    curso.id !== cursoActual.id && curso.activo
  ) || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setAlumnosSeleccionados(alumnos.map(a => a.id));
    } else {
      setAlumnosSeleccionados([]);
    }
  };

  const handleSelectAlumno = (alumnoId: string, checked: boolean) => {
    if (checked) {
      setAlumnosSeleccionados(prev => [...prev, alumnoId]);
    } else {
      setAlumnosSeleccionados(prev => prev.filter(id => id !== alumnoId));
    }
  };

  const handlePromocionMasiva = () => {
    if (!cursoDestinoId || alumnosSeleccionados.length === 0) return;

    const promociones = alumnosSeleccionados.map(alumnoId => ({
      alumno_id: alumnoId,
      curso_destino_id: cursoDestinoId,
      observaciones: observaciones.trim() || undefined,
    }));

    promoverAlumnosEnLote.mutate(promociones, {
      onSuccess: () => {
        setAlumnosSeleccionados([]);
        setCursoDestinoId('');
        setObservaciones('');
        onClose();
      },
    });
  };

  const formatCurso = (curso: Curso) => 
    `${curso.anio}° ${curso.division} - ${curso.turno}`;

  // Sugerir curso automático (siguiente año, misma división)
  const cursoSugerido = cursosDisponibles.find(curso => 
    curso.anio === cursoActual.anio + 1 && 
    curso.division === cursoActual.division &&
    curso.turno === cursoActual.turno
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Promoción Masiva de Alumnos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del curso actual */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>Curso actual:</span>
              <Badge variant="outline">{formatCurso(cursoActual)}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Total de alumnos: {alumnos.length}
            </p>
          </div>

          {/* Selección de curso destino */}
          <div className="space-y-2">
            <Label htmlFor="curso-destino">Curso de destino *</Label>
            <Select value={cursoDestinoId} onValueChange={setCursoDestinoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso de destino" />
              </SelectTrigger>
              <SelectContent>
                {cursoSugerido && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                      Promoción Automática
                    </div>
                    <SelectItem value={cursoSugerido.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{formatCurso(cursoSugerido)}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Recomendado
                        </Badge>
                      </div>
                    </SelectItem>
                  </>
                )}
                
                <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                  Otros Cursos
                </div>
                {cursosDisponibles
                  .filter(curso => curso.id !== cursoSugerido?.id)
                  .map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {formatCurso(curso)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

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

          {/* Selección de alumnos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Seleccionar alumnos a promover</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={alumnosSeleccionados.length === alumnos.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Seleccionar todos
                </Label>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {alumnos.map((alumno) => (
                <div key={alumno.id} className="flex items-center space-x-3 p-3 border-b last:border-b-0">
                  <Checkbox
                    id={`alumno-${alumno.id}`}
                    checked={alumnosSeleccionados.includes(alumno.id)}
                    onCheckedChange={(checked) => handleSelectAlumno(alumno.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {alumno.nombre} {alumno.apellido}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={alumno.grupo_taller === 'A' ? 'default' : 'secondary'} className="text-xs">
                        Grupo {alumno.grupo_taller}
                      </Badge>
                      {alumno.dni && (
                        <span className="text-xs text-gray-500">DNI: {alumno.dni}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500">
              {alumnosSeleccionados.length} de {alumnos.length} alumnos seleccionados
            </p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Agregar comentarios sobre la promoción masiva..."
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
              onClick={handlePromocionMasiva}
              disabled={!cursoDestinoId || alumnosSeleccionados.length === 0 || promoverAlumnosEnLote.isPending}
            >
              {promoverAlumnosEnLote.isPending 
                ? 'Promoviendo...' 
                : `Promover ${alumnosSeleccionados.length} Alumnos`
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
