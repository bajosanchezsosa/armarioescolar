
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, School, Calendar, BookOpen, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { usePlanillaByToken, useUpdatePlanillaCompartible, useAlumnosForPlanilla } from '@/hooks/usePlanillasCompartibles';
import { useNotas } from '@/hooks/useNotas';
import { useCreateNota, useUpdateNota } from '@/hooks/useNotas';

interface PlanillaPublicaProps {
  token: string;
}

export const PlanillaPublica = ({ token }: PlanillaPublicaProps) => {
  const [profesorNombre, setProfesorNombre] = useState('');
  const [notasData, setNotasData] = useState<Record<string, { nota: string; observaciones: string; tipo_evaluacion: string }>>({});
  const [saving, setSaving] = useState(false);

  const { data: planilla, isLoading: planillaLoading, error: planillaError } = usePlanillaByToken(token);
  const { data: alumnos = [], isLoading: alumnosLoading } = useAlumnosForPlanilla(planilla?.curso_id || '');
  const { data: notasExistentes = [] } = useNotas(
    planilla?.curso_id || '',
    planilla?.materia_id || '',
    planilla?.periodo_id || ''
  );
  
  const updatePlanilla = useUpdatePlanillaCompartible();
  const createNota = useCreateNota();
  const updateNota = useUpdateNota();

  console.log('PlanillaPublica - Token:', token);
  console.log('PlanillaPublica - Planilla:', planilla);
  console.log('PlanillaPublica - Planilla curso_id:', planilla?.curso_id);
  console.log('PlanillaPublica - Alumnos:', alumnos);
  console.log('PlanillaPublica - Alumnos length:', alumnos?.length);
  console.log('PlanillaPublica - AlumnosLoading:', alumnosLoading);
  console.log('PlanillaPublica - PlanillaLoading:', planillaLoading);
  console.log('PlanillaPublica - Notas existentes:', notasExistentes);

  React.useEffect(() => {
    if (planilla?.profesor_nombre) {
      setProfesorNombre(planilla.profesor_nombre);
    }
  }, [planilla]);

  React.useEffect(() => {
    if (notasExistentes.length > 0) {
      const notasMap = notasExistentes.reduce((acc, nota) => {
        acc[nota.alumno_id] = {
          nota: nota.nota || '',
          observaciones: nota.observaciones || '',
          tipo_evaluacion: nota.tipo_evaluacion || 'parcial'
        };
        return acc;
      }, {} as Record<string, { nota: string; observaciones: string; tipo_evaluacion: string }>);
      setNotasData(notasMap);
    }
  }, [notasExistentes]);

  const alumnosActivos = alumnos.filter(a => a.activo);
  
  console.log('PlanillaPublica - Alumnos activos:', alumnosActivos);
  console.log('PlanillaPublica - Alumnos activos length:', alumnosActivos.length);

  const handleNotaChange = (alumnoId: string, field: string, value: string) => {
    setNotasData(prev => ({
      ...prev,
      [alumnoId]: {
        ...prev[alumnoId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    if (!profesorNombre.trim()) {
      toast.error('Por favor ingresa tu nombre como profesor');
      return;
    }

    if (!planilla) {
      toast.error('Error: No se pudo cargar la planilla');
      return;
    }

    setSaving(true);

    try {
      // Actualizar nombre del profesor en la planilla
      await updatePlanilla.mutateAsync({
        id: planilla.id,
        profesor_nombre: profesorNombre.trim(),
        estado: 'completada'
      });

      // Guardar/actualizar notas
      const notasPromises = Object.entries(notasData).map(async ([alumnoId, data]) => {
        if (!data.nota.trim()) return;

        const notaExistente = notasExistentes.find(n => n.alumno_id === alumnoId);
        
        const notaData = {
          alumno_id: alumnoId,
          materia_id: planilla.materia_id,
          curso_id: planilla.curso_id,
          periodo_id: planilla.periodo_id,
          nota: data.nota.trim(),
          tipo_evaluacion: data.tipo_evaluacion || 'parcial',
          observaciones: data.observaciones?.trim() || null,
          fecha: format(new Date(), 'yyyy-MM-dd')
        };

        if (notaExistente) {
          return updateNota.mutateAsync({
            id: notaExistente.id,
            ...notaData
          });
        } else {
          return createNota.mutateAsync(notaData);
        }
      });

      await Promise.all(notasPromises);
      
      toast.success('¡Planilla guardada exitosamente!');
    } catch (error) {
      console.error('Error saving planilla:', error);
      toast.error('Error al guardar la planilla');
    } finally {
      setSaving(false);
    }
  };

  if (planillaLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando planilla...</p>
        </div>
      </div>
    );
  }

  if (planilla && alumnosLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  if (planillaError || !planilla) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Planilla no encontrada</h1>
          <p className="text-gray-600">No se pudo cargar la planilla con el token proporcionado.</p>
        </div>
      </div>
    );
  }

  if (planilla && !alumnosLoading && alumnosActivos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-orange-600 mb-2">Sin alumnos</h1>
          <p className="text-gray-600">No hay alumnos activos en este curso para cargar notas.</p>
          <p className="text-sm text-gray-500 mt-2">
            Curso ID: {planilla.curso_id}<br/>
            Total alumnos: {alumnos.length}<br/>
            Alumnos activos: {alumnosActivos.length}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <School className="h-6 w-6" />
                Planilla de Notas
              </CardTitle>
              {planilla.estado === 'completada' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Completada</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Información del profesor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Profesor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="profesor">Nombre completo del profesor *</Label>
              <Input
                id="profesor"
                value={profesorNombre}
                onChange={(e) => setProfesorNombre(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
                disabled={planilla.estado === 'completada'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Notas</CardTitle>
            <p className="text-sm text-gray-600">
              Completa las notas para cada alumno. Los campos marcados con * son obligatorios.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {alumnosActivos.map((alumno, index) => {
                const notaData = notasData[alumno.id] || { nota: '', observaciones: '', tipo_evaluacion: 'parcial' };
                
                return (
                  <div key={alumno.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">
                        {index + 1}. {alumno.apellido}, {alumno.nombre}
                      </h3>
                      {alumno.dni && (
                        <span className="text-xs text-gray-500">DNI: {alumno.dni}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Evaluación *</Label>
                        <Select
                          value={notaData.tipo_evaluacion}
                          onValueChange={(value) => handleNotaChange(alumno.id, 'tipo_evaluacion', value)}
                          disabled={planilla.estado === 'completada'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parcial">Parcial</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                            <SelectItem value="recuperacion">Recuperación</SelectItem>
                            <SelectItem value="trabajo_practico">Trabajo Práctico</SelectItem>
                            <SelectItem value="oral">Oral</SelectItem>
                            <SelectItem value="proyecto">Proyecto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Nota *</Label>
                        <Input
                          value={notaData.nota}
                          onChange={(e) => handleNotaChange(alumno.id, 'nota', e.target.value)}
                          placeholder="ej: 8, Aprobado, etc."
                          disabled={planilla.estado === 'completada'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Observaciones</Label>
                        <Textarea
                          value={notaData.observaciones}
                          onChange={(e) => handleNotaChange(alumno.id, 'observaciones', e.target.value)}
                          placeholder="Observaciones adicionales..."
                          rows={2}
                          disabled={planilla.estado === 'completada'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {planilla.estado !== 'completada' && (
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSaveAll}
                  disabled={saving || !profesorNombre.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar y Completar Planilla
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
