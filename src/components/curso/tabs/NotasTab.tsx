
import React, { useState } from 'react';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useAlumnos } from '@/hooks/useAlumnos';
import { useNotas, Nota } from '@/hooks/useNotas';
import { usePeriodosNotas, PeriodoNota } from '@/hooks/usePeriodosNotas';
import { NotaForm } from '@/components/curso/notas/NotaForm';
import { NotasTable } from '@/components/curso/notas/NotasTable';
import { PeriodosManager } from '@/components/curso/notas/PeriodosManager';
import { PlanillasIndividuales } from '@/components/curso/notas/PlanillasIndividuales';
import { RegistroManualExcel } from '@/components/curso/notas/RegistroManualExcel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Users, BookOpen, AlertCircle, Share2, Grid3X3 } from 'lucide-react';

interface NotasTabProps {
  cursoId: string;
}

export const NotasTab = ({ cursoId }: NotasTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoNota | null>(null);
  
  const { data: materias = [], isLoading: materiasLoading, error: materiasError } = useMaterias(cursoId);
  const { data: alumnos = [], isLoading: alumnosLoading, error: alumnosError } = useAlumnos(cursoId);
  const { data: periodos = [], isLoading: periodosLoading } = usePeriodosNotas(cursoId);
  const { data: notas = [], isLoading: notasLoading } = useNotas(
    cursoId, 
    undefined, 
    selectedPeriodo?.id
  );

  // Debug logs
  React.useEffect(() => {
    console.log('NotasTab - Curso ID:', cursoId);
    console.log('NotasTab - Materias:', materias?.length || 0);
    console.log('NotasTab - Alumnos:', alumnos?.length || 0);
    console.log('NotasTab - Materias Error:', materiasError);
    console.log('NotasTab - Alumnos Error:', alumnosError);
  }, [cursoId, materias, alumnos, materiasError, alumnosError]);

  // Seleccionar el primer período activo por defecto
  React.useEffect(() => {
    if (periodos.length > 0 && !selectedPeriodo) {
      const primerPeriodoActivo = periodos.find(p => p.activo) || periodos[0];
      setSelectedPeriodo(primerPeriodoActivo);
    }
  }, [periodos, selectedPeriodo]);

  if (materiasLoading || alumnosLoading || periodosLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Show error messages if data fails to load
  if (materiasError || alumnosError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error al cargar datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {materiasError && (
              <p className="text-red-600">Error al cargar materias: {materiasError.message}</p>
            )}
            {alumnosError && (
              <p className="text-red-600">Error al cargar alumnos: {alumnosError.message}</p>
            )}
            <p className="text-gray-600 mt-4">
              Por favor, verifica la conexión a la base de datos y que el curso tenga datos configurados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (materias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            No hay materias configuradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Primero debes agregar materias en la pestaña "Materias" 
            antes de poder registrar notas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const alumnosActivos = alumnos.filter(a => a.activo);
  
  if (alumnosActivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            No hay alumnos activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-600">
              No hay alumnos activos en este curso. Agrega alumnos en la pestaña "Alumnos" 
              para poder registrar notas.
            </p>
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <p>Debug info:</p>
              <p>Total alumnos: {alumnos.length}</p>
              <p>Alumnos activos: {alumnosActivos.length}</p>
              <p>Curso ID: {cursoId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (nota: Nota) => {
    setEditingNota(nota);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNota(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Registro Individual de Notas</h2>
            <p className="text-gray-600">
              {editingNota ? 'Editar nota existente' : 'Registrar nueva nota'}
              {selectedPeriodo && ` - ${selectedPeriodo.nombre}`}
            </p>
          </div>
        </div>

        <NotaForm 
          alumnos={alumnos}
          materias={materias}
          cursoId={cursoId}
          periodoId={selectedPeriodo?.id}
          editingNota={editingNota}
          onCancel={() => {
            setShowForm(false);
            setEditingNota(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Notas por Períodos</h2>
          <p className="text-gray-600">
            Administra las calificaciones de los alumnos organizadas por períodos
          </p>
        </div>
      </div>

      {/* Gestión de Períodos */}
      <PeriodosManager 
        cursoId={cursoId} 
        onPeriodoSelect={setSelectedPeriodo}
        selectedPeriodo={selectedPeriodo}
      />

      {selectedPeriodo && (
        <Tabs defaultValue="individuales" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individuales" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Planillas Individuales
            </TabsTrigger>
            <TabsTrigger value="registro-excel" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Registro Manual
            </TabsTrigger>
            <TabsTrigger value="notas-individuales" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas Individuales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individuales" className="space-y-6">
            <PlanillasIndividuales 
              cursoId={cursoId}
              periodoId={selectedPeriodo.id}
              periodo={selectedPeriodo}
              materias={materias}
            />
          </TabsContent>

          <TabsContent value="registro-excel" className="space-y-6">
            <RegistroManualExcel
              cursoId={cursoId}
              periodoId={selectedPeriodo.id}
              periodo={selectedPeriodo}
              materias={materias}
            />
          </TabsContent>

          <TabsContent value="notas-individuales" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Registro Individual - {selectedPeriodo.nombre}</h3>
                <p className="text-sm text-gray-600">
                  Registra notas individuales una por una
                </p>
              </div>
              <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{materias.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Materias configuradas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alumnosActivos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Alumnos activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notas del Período</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notas.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Notas registradas
                  </p>
                </CardContent>
              </Card>
            </div>

            <NotasTable 
              notas={notas}
              materias={materias}
              onEdit={(nota) => {
                setEditingNota(nota);
                setShowForm(true);
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
