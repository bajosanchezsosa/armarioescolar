
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, School, Calendar, BookOpen, Save, CheckCircle, AlertCircle, User } from 'lucide-react';
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
  const [notasData, setNotasData] = useState<Record<string, { nota: string }>>({});
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

  // Determinar si es PRE nota o nota final basado en el nombre del período
  const isPreNota = planilla?.periodo?.nombre?.toLowerCase().includes('pre') || false;
  const isNotaFinal = planilla?.periodo?.nombre?.toLowerCase().includes('final') || 
                     planilla?.periodo?.nombre?.toLowerCase().includes('cuatrimestre') || false;

  React.useEffect(() => {
    if (planilla?.profesor_nombre) {
      setProfesorNombre(planilla.profesor_nombre);
    }
  }, [planilla]);

  React.useEffect(() => {
    if (notasExistentes.length > 0) {
      const notasMap = notasExistentes.reduce((acc, nota) => {
        acc[nota.alumno_id] = {
          nota: nota.nota || ''
        };
        return acc;
      }, {} as Record<string, { nota: string }>);
      setNotasData(notasMap);
    }
  }, [notasExistentes]);

  const alumnosActivos = alumnos.filter(a => a.activo);

  const handleNotaChange = (alumnoId: string, value: string) => {
    setNotasData(prev => ({
      ...prev,
      [alumnoId]: {
        nota: value
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
      console.log('Planilla data before update:', {
        id: planilla.id,
        profesor_nombre: profesorNombre.trim(),
        estado: 'completada'
      });
      
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
        
        // Determinar el tipo de evaluación basado en el período
        let tipoEvaluacion = 'Parcial';
        if (isPreNota) {
          tipoEvaluacion = 'PRE';
        } else if (isNotaFinal) {
          tipoEvaluacion = 'Nota Final';
        }
        
        const notaData = {
          alumno_id: alumnoId,
          materia_id: planilla.materia_id,
          curso_id: planilla.curso_id,
          periodo_id: planilla.periodo_id,
          nota: data.nota.trim(),
          tipo_evaluacion: tipoEvaluacion,
          observaciones: `Planilla completada por: ${profesorNombre.trim()}`,
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
      console.error('Full error details:', JSON.stringify(error, null, 2));
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
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Profesor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="profesor">Nombre completo del profesor *</Label>
              <Input
                id="profesor"
                value={profesorNombre}
                onChange={(e) => setProfesorNombre(e.target.value)}
                placeholder="Ingresa tu nombre completo (cuenta como firma)"
                required
                disabled={planilla.estado === 'completada'}
              />
              <p className="text-xs text-gray-500">
                Este campo es obligatorio y cuenta como tu firma digital
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Notas</CardTitle>
            <p className="text-sm text-gray-600">
              {isPreNota 
                ? 'Selecciona TEA, TEP o TED para cada alumno'
                : isNotaFinal 
                ? 'Ingresa la nota del 1 al 10 para cada alumno'
                : 'Ingresa la nota para cada alumno'
              }
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alumnosActivos.map((alumno, index) => {
                const notaData = notasData[alumno.id] || { nota: '' };
                
                return (
                  <div key={alumno.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-lg">
                        {index + 1}. {alumno.apellido}, {alumno.nombre}
                      </h3>
                      {alumno.dni && (
                        <span className="text-sm text-gray-500">DNI: {alumno.dni}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Label className="min-w-20">Nota:</Label>
                      
                      {isPreNota ? (
                        <Select
                          value={notaData.nota}
                          onValueChange={(value) => handleNotaChange(alumno.id, value)}
                          disabled={planilla.estado === 'completada'}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEA">TEA</SelectItem>
                            <SelectItem value="TEP">TEP</SelectItem>
                            <SelectItem value="TED">TED</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : isNotaFinal ? (
                        <Select
                          value={notaData.nota}
                          onValueChange={(value) => handleNotaChange(alumno.id, value)}
                          disabled={planilla.estado === 'completada'}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={notaData.nota}
                          onChange={(e) => handleNotaChange(alumno.id, e.target.value)}
                          placeholder="Ingresa la nota"
                          className="w-32"
                          disabled={planilla.estado === 'completada'}
                        />
                      )}
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
                  size="lg"
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
