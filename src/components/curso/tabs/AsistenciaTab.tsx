
import React from 'react';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useAlumnos } from '@/hooks/useAlumnos';
import { AsistenciaForm } from '@/components/curso/asistencia/AsistenciaForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, BookOpen } from 'lucide-react';

interface AsistenciaTabProps {
  cursoId: string;
}

export const AsistenciaTab = ({ cursoId }: AsistenciaTabProps) => {
  const { data: materias = [], isLoading: materiasLoading } = useMaterias(cursoId);
  const { data: alumnos = [], isLoading: alumnosLoading } = useAlumnos(cursoId);

  if (materiasLoading || alumnosLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (materias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            No hay materias configuradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Primero debes agregar materias en la pestaña "Materias" 
            antes de poder registrar asistencias.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (alumnos.filter(a => a.activo).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            No hay alumnos activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            No hay alumnos activos en este curso. Agrega alumnos en la pestaña "Alumnos" 
            para poder registrar asistencias.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Registro de Asistencias</h2>
          <p className="text-gray-600">
            Registra la asistencia de los alumnos por materia y fecha
          </p>
        </div>
      </div>

      <AsistenciaForm 
        materias={materias}
        alumnos={alumnos.filter(a => a.activo)}
        cursoId={cursoId}
      />
    </div>
  );
};
