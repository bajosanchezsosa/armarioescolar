
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AsistenciaStudentRow } from './AsistenciaStudentRow';
import { Alumno, EstadoAsistencia } from '@/types/database';

interface AsistenciaTableProps {
  alumnos: Alumno[];
  asistencias: Record<string, EstadoAsistencia>;
  onEstadoChange: (alumnoId: string, checked: boolean) => void;
  onEstadoSpecialChange: (alumnoId: string, estado: EstadoAsistencia) => void;
}

export const AsistenciaTable = ({
  alumnos,
  asistencias,
  onEstadoChange,
  onEstadoSpecialChange
}: AsistenciaTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Presente</TableHead>
          <TableHead>Alumno</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Estado Especial</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alumnos.map((alumno) => (
          <AsistenciaStudentRow
            key={alumno.id}
            alumno={alumno}
            estadoActual={asistencias[alumno.id] || 'P'}
            onEstadoChange={onEstadoChange}
            onEstadoSpecialChange={onEstadoSpecialChange}
          />
        ))}
      </TableBody>
    </Table>
  );
};
