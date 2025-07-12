import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Users, BookOpen } from 'lucide-react';

interface PlanillaIntensificacionDialogProps {
  materiasPendientes: any[];
  materias: any[];
  alumnos: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursoId: string;
}

export const PlanillaIntensificacionDialog = ({
  materiasPendientes,
  materias,
  alumnos,
  open,
  onOpenChange,
  cursoId
}: PlanillaIntensificacionDialogProps) => {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');

  // Filtrar materias que tienen alumnos intensificando
  const materiasConIntensificacion = materias.filter(materia => 
    materiasPendientes.some(mp => mp.vinculada_con_materia_id === materia.id)
  );

  // Obtener alumnos que intensifican en la materia seleccionada
  const alumnosIntensificando = materiaSeleccionada ? 
    materiasPendientes.filter(mp => mp.vinculada_con_materia_id === materiaSeleccionada) : [];

  const getAlumnoName = (alumnoId: string) => {
    const alumno = alumnos.find(a => a.id === alumnoId);
    return alumno ? `${alumno.apellido}, ${alumno.nombre}` : 'Alumno no encontrado';
  };

  const getMateriaOriginalName = (materiaOriginalId: string) => {
    const materia = materias.find(m => m.id === materiaOriginalId);
    return materia ? materia.nombre : 'Materia no encontrada';
  };

  const getMateriaName = (materiaId: string) => {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? materia.nombre : 'Materia no encontrada';
  };

  const handleGenerarPlanilla = () => {
    // Aquí implementarías la lógica para generar la planilla
    // Por ahora solo mostraremos un mensaje
    alert('Funcionalidad de generación de planilla en desarrollo');
  };

  const handleClose = () => {
    onOpenChange(false);
    setMateriaSeleccionada('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Planilla de Intensificación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selección de materia */}
          <div className="space-y-2">
            <Label htmlFor="materia-planilla" className="text-sm font-medium">
              Seleccionar materia para generar planilla
            </Label>
            <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una materia con intensificación" />
              </SelectTrigger>
              <SelectContent>
                {materiasConIntensificacion.map((materia) => (
                  <SelectItem key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estadísticas */}
          {materiaSeleccionada && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Alumnos Intensificando</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {alumnosIntensificando.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Materia Actual</p>
                      <p className="text-sm font-bold text-gray-900">
                        {getMateriaName(materiaSeleccionada)}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Acción</p>
                      <Button
                        size="sm"
                        onClick={handleGenerarPlanilla}
                        className="bg-teal-600 hover:bg-teal-700 mt-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generar Planilla
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de alumnos intensificando */}
          {materiaSeleccionada && alumnosIntensificando.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Alumnos Intensificando en {getMateriaName(materiaSeleccionada)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alumno</TableHead>
                      <TableHead>Materia Original</TableHead>
                      <TableHead>Año Origen</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alumnosIntensificando.map((mp) => (
                      <TableRow key={mp.id}>
                        <TableCell className="font-medium">
                          {getAlumnoName(mp.alumno_id)}
                        </TableCell>
                        <TableCell>
                          {getMateriaOriginalName(mp.materia_original_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {mp.anio_origen}° año
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={
                              mp.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                              mp.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }
                          >
                            {mp.estado || 'pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {mp.observaciones || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Mensaje cuando no hay intensificación */}
          {materiaSeleccionada && alumnosIntensificando.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No hay alumnos intensificando en esta materia
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cerrar
            </Button>
            {materiaSeleccionada && alumnosIntensificando.length > 0 && (
              <Button
                onClick={handleGenerarPlanilla}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Planilla
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 