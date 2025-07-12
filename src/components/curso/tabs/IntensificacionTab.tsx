import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Plus, 
  FileText, 
  Users, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useMateriasPendientes, useEliminarMateriaPendiente } from '@/hooks/useMateriasPendientes';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useAlumnos } from '@/hooks/useAlumnos';
import { MateriasPendientesList } from './intensificacion/MateriasPendientesList';
import { VincularMateriaDialog } from './intensificacion/VincularMateriaDialog';
import { PlanillaIntensificacionDialog } from './intensificacion/PlanillaIntensificacionDialog';
import { RegistrarMateriaPendienteDialog } from './intensificacion/RegistrarMateriaPendienteDialog';

interface IntensificacionTabProps {
  cursoId: string;
}

export const IntensificacionTab = ({ cursoId }: IntensificacionTabProps) => {
  const [showVincularDialog, setShowVincularDialog] = useState(false);
  const [showPlanillaDialog, setShowPlanillaDialog] = useState(false);
  const [showRegistrarDialog, setShowRegistrarDialog] = useState(false);
  const [selectedMateriaPendiente, setSelectedMateriaPendiente] = useState<any>(null);

  const { data: materiasPendientes, isLoading: loadingPendientes } = useMateriasPendientes(cursoId);
  const { data: materias } = useMaterias(cursoId);
  const { data: alumnos } = useAlumnos(cursoId);
  const eliminarMateriaPendiente = useEliminarMateriaPendiente();

  const materiasVinculadas = materiasPendientes?.filter(mp => mp.vinculada_con_materia_id) || [];
  const materiasSinVincular = materiasPendientes?.filter(mp => !mp.vinculada_con_materia_id) || [];

  const handleVincularMateria = (materiaPendiente: any) => {
    setSelectedMateriaPendiente(materiaPendiente);
    setShowVincularDialog(true);
  };

  const handleEliminarMateria = (materiaPendienteId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta materia pendiente? Esta acción no se puede deshacer.')) {
      eliminarMateriaPendiente.mutate(materiaPendienteId);
    }
  };

  const handleCrearPlanilla = () => {
    setShowPlanillaDialog(true);
  };

  const handleRegistrarMateriaPendiente = () => {
    setShowRegistrarDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Intensificación</h2>
          <p className="text-gray-600 mt-1">
            Administra las materias pendientes y la intensificación de alumnos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRegistrarMateriaPendiente}
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Materia Pendiente
          </Button>
          <Button 
            onClick={handleCrearPlanilla}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Crear Planilla
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Materias Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {materiasPendientes?.length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Vincular</p>
                <p className="text-2xl font-bold text-red-600">
                  {materiasSinVincular.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vinculadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {materiasVinculadas.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pendientes" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Materias Pendientes
          </TabsTrigger>
          <TabsTrigger value="vinculadas" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Materias Vinculadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Materias Pendientes sin Vincular
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPendientes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando materias pendientes...</p>
                </div>
              ) : materiasSinVincular.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay materias pendientes sin vincular</p>
                </div>
              ) : (
                <MateriasPendientesList
                  materiasPendientes={materiasSinVincular}
                  materias={materias || []}
                  alumnos={alumnos || []}
                  onVincular={handleVincularMateria}
                  onEliminar={handleEliminarMateria}
                  isDeleting={eliminarMateriaPendiente.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vinculadas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Materias Vinculadas para Intensificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {materiasVinculadas.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay materias vinculadas para intensificación</p>
                </div>
              ) : (
                <MateriasPendientesList
                  materiasPendientes={materiasVinculadas}
                  materias={materias || []}
                  alumnos={alumnos || []}
                  onVincular={handleVincularMateria}
                  onEliminar={handleEliminarMateria}
                  showVinculadas={true}
                  isDeleting={eliminarMateriaPendiente.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showVincularDialog && selectedMateriaPendiente && (
        <VincularMateriaDialog
          materiaPendiente={selectedMateriaPendiente}
          materias={materias || []}
          open={showVincularDialog}
          onOpenChange={setShowVincularDialog}
          cursoId={cursoId}
        />
      )}

      {showPlanillaDialog && (
        <PlanillaIntensificacionDialog
          materiasPendientes={materiasVinculadas}
          materias={materias || []}
          alumnos={alumnos || []}
          open={showPlanillaDialog}
          onOpenChange={setShowPlanillaDialog}
          cursoId={cursoId}
        />
      )}

      {showRegistrarDialog && (
        <RegistrarMateriaPendienteDialog
          alumnos={alumnos || []}
          open={showRegistrarDialog}
          onOpenChange={setShowRegistrarDialog}
          cursoId={cursoId}
        />
      )}
    </div>
  );
}; 