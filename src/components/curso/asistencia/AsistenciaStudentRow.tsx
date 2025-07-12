
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EstadoAsistencia, Alumno } from '@/types/database';

interface AsistenciaStudentRowProps {
  alumno: Alumno;
  estadoActual: EstadoAsistencia;
  onEstadoChange: (alumnoId: string, checked: boolean) => void;
  onEstadoSpecialChange: (alumnoId: string, estado: EstadoAsistencia) => void;
}

const ESTADOS_ASISTENCIA: { value: EstadoAsistencia; label: string; color: string }[] = [
  { value: 'P', label: 'Presente', color: 'bg-green-500' },
  { value: 'A', label: 'Ausente', color: 'bg-red-500' },
  { value: 'T', label: 'Tardanza', color: 'bg-yellow-500' },
  { value: 'J', label: 'Justificado', color: 'bg-blue-500' },
];

export const AsistenciaStudentRow = ({
  alumno,
  estadoActual,
  onEstadoChange,
  onEstadoSpecialChange
}: AsistenciaStudentRowProps) => {
  const getEstadoInfo = (estado: EstadoAsistencia) => {
    return ESTADOS_ASISTENCIA.find(e => e.value === estado) || ESTADOS_ASISTENCIA[0];
  };

  const estadoInfo = getEstadoInfo(estadoActual);

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={estadoActual === 'P'}
          onCheckedChange={(checked) => onEstadoChange(alumno.id, !!checked)}
          className="scale-125"
        />
      </TableCell>
      <TableCell className="font-medium">
        {alumno.apellido}, {alumno.nombre}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{alumno.grupo_taller}</Badge>
      </TableCell>
      <TableCell>
        {estadoActual !== 'P' && estadoActual !== 'A' && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${estadoInfo.color}`} />
            {estadoInfo.label}
          </div>
        )}
        {(estadoActual === 'P' || estadoActual === 'A') && (
          <Select
            value=""
            onValueChange={(value: EstadoAsistencia) => 
              onEstadoSpecialChange(alumno.id, value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Especial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="T">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  Tardanza
                </div>
              </SelectItem>
              <SelectItem value="J">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Justificado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </TableCell>
    </TableRow>
  );
};
