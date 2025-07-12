import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAlumnos } from '@/hooks/useAlumnos';
import { RegistroManualHeader } from './registro-manual/RegistroManualHeader';
import { RegistroManualTable } from './registro-manual/RegistroManualTable';
import { RegistroManualLegend } from './registro-manual/RegistroManualLegend';
import { EmptyStateCard } from './registro-manual/EmptyStateCard';
import { useRegistroManualLogic } from './registro-manual/useRegistroManualLogic';

interface RegistroManualExcelProps {
  cursoId: string;
  periodoId: string;
  periodo: any;
  materias: any[];
}

export const RegistroManualExcel = ({ cursoId, periodoId, periodo, materias }: RegistroManualExcelProps) => {
  const { data: alumnos = [] } = useAlumnos(cursoId);
  const alumnosActivos = alumnos.filter(a => a.activo);

  const {
    notasData,
    isLoading,
    handleNotaChange,
    getNotaValue,
    getNotaStatus,
    handleSave
  } = useRegistroManualLogic({ cursoId, periodoId });

  if (alumnosActivos.length === 0) {
    return <EmptyStateCard />;
  }

  return (
    <Card>
      <RegistroManualHeader
        periodoNombre={periodo.nombre}
        isLoading={isLoading}
        onSave={() => handleSave(materias)}
      />
      <CardContent>
        <RegistroManualTable
          alumnos={alumnosActivos}
          materias={materias}
          getNotaValue={getNotaValue}
          getNotaStatus={getNotaStatus}
          onNotaChange={handleNotaChange}
        />
        <RegistroManualLegend />
      </CardContent>
    </Card>
  );
};