import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useCrearMateriaPendiente } from '@/hooks/useMateriasPendientes';
import { useCursos } from '@/hooks/useCursos';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { User, BookOpen, Calendar, Plus } from 'lucide-react';

interface RegistrarMateriaPendienteDialogProps {
  alumnos: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursoId: string;
}

export const RegistrarMateriaPendienteDialog = ({
  alumnos,
  open,
  onOpenChange,
  cursoId
}: RegistrarMateriaPendienteDialogProps) => {
  const [alumnoId, setAlumnoId] = useState('');
  const [materiaOriginalId, setMateriaOriginalId] = useState('');
  const [cursoOrigenId, setCursoOrigenId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  const crearMateriaPendiente = useCrearMateriaPendiente();
  const { data: cursos } = useCursos();
  const { data: materias } = useMaterias(cursoOrigenId);

  // Filtrar cursos que no sean el actual (para materias de años anteriores)
  const cursosAnteriores = cursos?.filter(curso => curso.id !== cursoId) || [];

  const anioActual = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alumnoId || !materiaOriginalId || !cursoOrigenId) {
      return;
    }

    try {
      await crearMateriaPendiente.mutateAsync({
        alumnoId,
        materiaOriginalId,
        cursoOrigenId,
        cursoDestinoId: cursoId, // El curso destino es el actual
        anioLectivo: anioActual,
        observaciones: observaciones.trim() || undefined,
        tipo: 'intensificacion', // O 'recursa', se podría agregar un selector
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error al crear materia pendiente:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setAlumnoId('');
    setMateriaOriginalId('');
    setCursoOrigenId('');
    setObservaciones('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-600" />
            Registrar Materia Pendiente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de alumno */}
          <div className="space-y-2">
            <Label htmlFor="alumno" className="text-sm font-medium">
              Alumno
            </Label>
            <Select value={alumnoId} onValueChange={setAlumnoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un alumno" />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((alumno) => (
                  <SelectItem key={alumno.id} value={alumno.id}>
                    {alumno.apellido}, {alumno.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de curso de origen */}
          <div className="space-y-2">
            <Label htmlFor="curso-origen" className="text-sm font-medium">
              Curso de origen de la materia pendiente
            </Label>
            <Select value={cursoOrigenId} onValueChange={setCursoOrigenId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el curso de origen" />
              </SelectTrigger>
              <SelectContent>
                {cursosAnteriores.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.anio}°{curso.division} - {curso.orientacion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de materia original */}
          <div className="space-y-2">
            <Label htmlFor="materia-original" className="text-sm font-medium">
              Materia pendiente
            </Label>
            <Select 
              value={materiaOriginalId} 
              onValueChange={setMateriaOriginalId}
              disabled={!cursoOrigenId}
            >
              <SelectTrigger>
                <SelectValue placeholder={cursoOrigenId ? "Selecciona la materia" : "Primero selecciona un curso"} />
              </SelectTrigger>
              <SelectContent>
                {materias?.map((materia) => (
                  <SelectItem key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </SelectItem>
                ))}
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
              placeholder="Agregar notas sobre la materia pendiente..."
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
              disabled={crearMateriaPendiente.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!alumnoId || !materiaOriginalId || !cursoOrigenId || crearMateriaPendiente.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {crearMateriaPendiente.isPending ? 'Registrando...' : 'Registrar Materia Pendiente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 