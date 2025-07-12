
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AttendanceButtonGroup } from './AttendanceButtonGroup';
import { Alumno, EstadoAsistencia, GrupoTaller } from '@/types/database';

interface GroupedAttendanceTableProps {
  alumnos: Alumno[];
  asistencias: Record<string, EstadoAsistencia>;
  onEstadoChange: (alumnoId: string, estado: EstadoAsistencia) => void;
  grupo?: GrupoTaller;
  sinClase?: boolean;
  onSinClaseChange?: (grupo: GrupoTaller, sinClase: boolean) => void;
  sinClaseGrupos?: Record<string, boolean>;
}

export const GroupedAttendanceTable = ({ 
  alumnos, 
  asistencias, 
  onEstadoChange, 
  grupo,
  sinClase = false,
  onSinClaseChange,
  sinClaseGrupos = {}
}: GroupedAttendanceTableProps) => {
  // Filtrar alumnos por grupo si se especifica
  const alumnosFiltrados = grupo && grupo !== 'todos' 
    ? alumnos.filter(alumno => alumno.grupo_taller === grupo)
    : alumnos;

  if (alumnosFiltrados.length === 0) {
    return null;
  }

  const title = grupo === 'todos' ? 'Todo el curso' : `Grupo ${grupo}`;
  const sinClaseGrupo = grupo === 'todos' ? sinClase : (sinClaseGrupos[grupo as string] || false);

  const handleSinClaseToggle = () => {
    if (onSinClaseChange && grupo && grupo !== 'todos') {
      onSinClaseChange(grupo, !sinClaseGrupo);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-gray-600">
              {alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          {grupo && grupo !== 'todos' && onSinClaseChange && (
            <div className="flex items-center space-x-2">
              <Switch
                id={`sin-clase-${grupo}`}
                checked={sinClaseGrupo}
                onCheckedChange={handleSinClaseToggle}
              />
              <Label htmlFor={`sin-clase-${grupo}`} className="text-sm">
                Sin clase
              </Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead className="text-center">Asistencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumnosFiltrados.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell className="font-medium">
                  {alumno.apellido}, {alumno.nombre}
                </TableCell>
                <TableCell className="text-center">
                  <AttendanceButtonGroup
                    currentState={asistencias[alumno.id] || 'P'}
                    onStateChange={(estado) => onEstadoChange(alumno.id, estado)}
                    disabled={sinClaseGrupo}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
