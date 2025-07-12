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
  const [anioOrigen, setAnioOrigen] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  
  const crearMateriaPendiente = useCrearMateriaPendiente();
  const { data: cursos } = useCursos();
  const { data: materias } = useMaterias(cursoSeleccionado || cursoId);

  // Filtrar cursos que no sean el actual (para materias de años anteriores)
  const cursosAnteriores = cursos?.filter(curso => curso.id !== cursoId) || [];

  // Generar años calendario (desde 2020 hasta el año actual + 1)
  const anioActual = new Date().getFullYear();
  const aniosCalendario = [];
  for (let anio = 2020; anio <= anioActual + 1; anio++) {
    aniosCalendario.push(anio);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alumnoId || !materiaOriginalId || !anioOrigen) {
      return;
    }

    try {
      await crearMateriaPendiente.mutateAsync({
        alumnoId,
        materiaOriginalId,
        anioOrigen: parseInt(anioOrigen),
        observaciones: observaciones.trim() || undefined,
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
    setAnioOrigen('');
    setObservaciones('');
    setCursoSeleccionado('');
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
            <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
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
              disabled={!cursoSeleccionado}
            >
              <SelectTrigger>
                <SelectValue placeholder={cursoSeleccionado ? "Selecciona la materia" : "Primero selecciona un curso"} />
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

          {/* Año calendario de origen */}
          <div className="space-y-2">
            <Label htmlFor="anio-origen" className="text-sm font-medium">
              Año calendario en que se cursó
            </Label>
            <Select value={anioOrigen} onValueChange={setAnioOrigen}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el año calendario" />
              </SelectTrigger>
              <SelectContent>
                {aniosCalendario.map((anio) => (
                  <SelectItem key={anio} value={anio.toString()}>
                    {anio}
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
              disabled={!alumnoId || !materiaOriginalId || !anioOrigen || crearMateriaPendiente.isPending}
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