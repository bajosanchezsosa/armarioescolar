import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useVincularMateria } from '@/hooks/useMateriasPendientes';
import { useCursos } from '@/hooks/useCursos';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { User, BookOpen, Link } from 'lucide-react';

interface VincularMateriaDialogProps {
  materiaPendiente: any;
  materias: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursoId: string;
}

export const VincularMateriaDialog = ({
  materiaPendiente,
  materias,
  open,
  onOpenChange,
  cursoId
}: VincularMateriaDialogProps) => {
  const [materiaVinculadaId, setMateriaVinculadaId] = useState('');
  const [tipoVinculacion, setTipoVinculacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursoId);
  
  const vincularMateria = useVincularMateria();
  const { data: cursos } = useCursos();
  const { data: materiasVinculadas } = useMaterias(cursoSeleccionado);

  const getAlumnoName = () => {
    return materiaPendiente.alumno ? 
      `${materiaPendiente.alumno.apellido}, ${materiaPendiente.alumno.nombre}` : 
      'Alumno no encontrado';
  };

  const getMateriaOriginalName = () => {
    return materiaPendiente.materia_original ? 
      materiaPendiente.materia_original.nombre : 
      'Materia no encontrada';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materiaVinculadaId || !tipoVinculacion) {
      return;
    }

    try {
      await vincularMateria.mutateAsync({
        materiaPendienteId: materiaPendiente.id,
        materiaDestinoId: materiaVinculadaId,
        tipo: tipoVinculacion as 'intensificacion' | 'recursa',
        contenidosPendientes: observaciones.trim() || undefined,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error al vincular materia:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMateriaVinculadaId('');
    setTipoVinculacion('');
    setObservaciones('');
    setCursoSeleccionado(cursoId);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-teal-600" />
            Vincular Materia Pendiente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del alumno */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Alumno
            </Label>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {getAlumnoName()}
            </div>
          </div>

          {/* Materia original */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Materia Pendiente
            </Label>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {getMateriaOriginalName()} ({materiaPendiente.anio_origen}° año)
            </div>
          </div>

          {/* Selección de curso para vincular */}
          <div className="space-y-2">
            <Label htmlFor="curso-vinculacion" className="text-sm font-medium">
              Curso donde va a intensificar
            </Label>
            <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos?.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.anio}°{curso.division} - {curso.orientacion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de materia para vincular */}
          <div className="space-y-2">
            <Label htmlFor="materia-vinculada" className="text-sm font-medium">
              Vincular con materia del curso seleccionado
            </Label>
            <Select 
              value={materiaVinculadaId} 
              onValueChange={setMateriaVinculadaId}
              disabled={!cursoSeleccionado}
            >
              <SelectTrigger>
                <SelectValue placeholder={cursoSeleccionado ? "Selecciona una materia" : "Primero selecciona un curso"} />
              </SelectTrigger>
              <SelectContent>
                {materiasVinculadas?.map((materia) => (
                  <SelectItem key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de vinculación */}
          <div className="space-y-2">
            <Label htmlFor="tipo-vinculacion" className="text-sm font-medium">
              Tipo de vinculación
            </Label>
            <Select value={tipoVinculacion} onValueChange={setTipoVinculacion}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intensificacion">Intensificación</SelectItem>
                <SelectItem value="recursa">Recursa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones (opcional)
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Agregar notas sobre la vinculación..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={vincularMateria.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!materiaVinculadaId || vincularMateria.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {vincularMateria.isPending ? 'Vinculando...' : 'Vincular Materia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 